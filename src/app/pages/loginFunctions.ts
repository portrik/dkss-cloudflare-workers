"use server";

import { env } from "cloudflare:workers";
import {
	type AuthenticationResponseJSON,
	generateAuthenticationOptions,
	generateRegistrationOptions,
	type RegistrationResponseJSON,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { sessions } from "@/session/store";

const getWebAuthnConfig = (request: Request): { rpId: string; rpName: string } => {
	const rpId = env.WEBAUTHN_RP_ID ?? new URL(request.url).hostname;
	const rpName = import.meta.env.VITE_IS_DEV_SERVER ? "Development App" : env.WEBAUTHN_APP_NAME;

	return {
		rpName: rpName,
		rpId: rpId,
	};
};

const startPasskeyRegistration = async (username: string) => {
	const { rpName, rpId } = getWebAuthnConfig(requestInfo.request);
	const { response } = requestInfo;

	const options = await generateRegistrationOptions({
		rpName: rpName,
		rpID: rpId,
		userName: username,
		authenticatorSelection: {
			// Require the authenticator to store the credential, enabling a username-less login experience
			residentKey: "required",
			// Prefer user verification (biometric, PIN, etc.), but allow authentication even if it's not available
			userVerification: "preferred",
		},
	});

	await sessions.save(response.headers, { challenge: options.challenge, userId: null });

	return options;
};

const startPasskeyLogin = async () => {
	const { rpId } = getWebAuthnConfig(requestInfo.request);
	const { response } = requestInfo;

	const options = await generateAuthenticationOptions({
		rpID: rpId,
		userVerification: "preferred",
		allowCredentials: [],
	});

	await sessions.save(response.headers, { challenge: options.challenge, userId: null });

	return options;
};

const finishPasskeyRegistration = async (
	username: string,
	registration: RegistrationResponseJSON,
): Promise<boolean> => {
	const { request, response } = requestInfo;
	const { origin } = new URL(request.url);

	const session = await sessions.load(request);
	const challenge = session?.challenge;

	if (!challenge) {
		return false;
	}

	const verification = await verifyRegistrationResponse({
		response: registration,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
	});

	if (!(verification.verified && verification.registrationInfo)) {
		return false;
	}

	await sessions.save(response.headers, { challenge: null, userId: null });

	const user = await db.user.create({
		data: {
			username: username,
		},
	});

	await db.credential.create({
		data: {
			userId: user.id,
			credentialId: verification.registrationInfo.credential.id,
			publicKey: verification.registrationInfo.credential.publicKey,
			counter: verification.registrationInfo.credential.counter,
		},
	});

	return true;
};

const finishPasskeyLogin = async (login: AuthenticationResponseJSON): Promise<boolean> => {
	const { request, response } = requestInfo;
	const { origin } = new URL(request.url);

	const session = await sessions.load(request);
	const challenge = session?.challenge;

	if (!challenge) {
		return false;
	}

	const credential = await db.credential.findUnique({
		where: {
			credentialId: login.id,
		},
	});

	if (!credential) {
		return false;
	}

	const verification = await verifyAuthenticationResponse({
		response: login,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
		requireUserVerification: false,
		credential: {
			id: credential.credentialId,
			publicKey: credential.publicKey as Uint8Array<ArrayBuffer>,
			counter: credential.counter,
		},
	});

	if (!verification.verified) {
		return false;
	}

	await db.credential.update({
		where: {
			credentialId: login.id,
		},
		data: {
			counter: verification.authenticationInfo.newCounter,
		},
	});

	const user = await db.user.findUnique({
		where: {
			id: credential.userId,
		},
	});

	if (!user) {
		return false;
	}

	await sessions.save(response.headers, {
		userId: user.id,
		challenge: null,
	});

	return true;
};

export { startPasskeyLogin, startPasskeyRegistration, finishPasskeyLogin, finishPasskeyRegistration };
