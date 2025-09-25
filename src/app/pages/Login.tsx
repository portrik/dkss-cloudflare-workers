"use client";

import type { RouteDefinition } from "rwsdk/router";
import type { RequestInfo } from "rwsdk/worker";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useId, useState, useTransition } from "react";
import {
	finishPasskeyLogin,
	finishPasskeyRegistration,
	startPasskeyLogin,
	startPasskeyRegistration,
} from "./loginFunctions";

const passkeyLogin = async (): Promise<boolean> => {
	const options = await startPasskeyLogin();
	const login = await startAuthentication({ optionsJSON: options });

	return await finishPasskeyLogin(login);
};

const passkeyRegister = async (username: string) => {
	const options = await startPasskeyRegistration(username);
	const registration = await startRegistration({ optionsJSON: options });

	return await finishPasskeyRegistration(username, registration);
};

const Login = (() => {
	const usernameId = useId();
	const [username, setUsername] = useState("");
	const [actionResult, setActionResult] = useState("");
	const [isPending, startTransition] = useTransition();

	const handlePasskeyLogin = () => {
		startTransition(() =>
			passkeyLogin()
				.then((success) => {
					if (!success) {
						return setActionResult("Login failed");
					}

					window.location.reload();
				})
				.catch((_error: unknown) => {
					// Log error for debugging
					setActionResult("An error occurred during the login process");
				}),
		);
	};

	const handlePasskeyRegister = () => {
		startTransition(() =>
			passkeyRegister(username)
				.then((success) => {
					if (!success) {
						return setActionResult("Registration failed");
					}

					return setActionResult("Registration successful. You can log in now.");
				})
				.catch((_error: unknown) => {
					// Log error for debugging
					setActionResult("An error occurred during the registration process");
				}),
		);
	};

	return (
		<div className="page-container">
			<div className="login-container">
				<main className="card fade-in">
					<h1>DKSS Authentication</h1>

					<form className="login-form">
						<div className="form-group">
							<label htmlFor={usernameId} className="form-label">
								Username
							</label>
							<input
								id={usernameId}
								type="text"
								value={username}
								onChange={(event) => setUsername(event.target.value)}
								placeholder="Enter your username"
								autoComplete="username"
							/>
						</div>

						{actionResult && (
							<div
								className={`status-message ${(() => {
									if (actionResult.includes("successful")) {
										return "status-success";
									}
									if (actionResult.includes("failed") || actionResult.includes("error")) {
										return "status-error";
									}
									return "status-info";
								})()}`}
							>
								{actionResult}
							</div>
						)}

						<div className="btn-group">
							<button onClick={handlePasskeyLogin} disabled={isPending} type="button" className="btn btn-primary">
								{isPending ? "Authenticating..." : "Login with Passkey"}
							</button>

							<button onClick={handlePasskeyRegister} disabled={isPending} type="button" className="btn btn-secondary">
								{isPending ? "Registering..." : "Register with Passkey"}
							</button>
						</div>
					</form>
				</main>
			</div>
		</div>
	);
}) satisfies RouteDefinition<RequestInfo>["handler"];

export { Login };
