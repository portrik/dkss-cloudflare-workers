import { DurableObject } from "cloudflare:workers";
import { MAX_SESSION_DURATION } from "rwsdk/auth";

type Session = {
	userId: string | null;
	challenge: string | null;
	createdAt: number;
};

class SessionDurableObject extends DurableObject {
	private session: Session | null;

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.session = null;
	}

	async saveSession({
		userId = null,
		challenge = null,
	}: {
		userId: string | null;
		challenge: string | null;
	}): Promise<Session> {
		this.session = {
			userId: userId,
			challenge: challenge,
			createdAt: Date.now(),
		};

		await this.ctx.storage.put<Session>("session", this.session);

		return this.session;
	}

	async getSession(): Promise<{ value: Session } | { error: string }> {
		if (this.session != null) {
			return { value: this.session };
		}

		const session = await this.ctx.storage.get<Session>("session");
		if (session == null) {
			return {
				error: "Invalid session",
			};
		}

		if (session.createdAt + MAX_SESSION_DURATION < Date.now()) {
			await this.revokeSession();

			return {
				error: "Session expired",
			};
		}

		this.session = session;
		return { value: this.session };
	}

	async revokeSession() {
		await this.ctx.storage.delete("session");
		this.session = null;
	}
}

export type { Session };
export { SessionDurableObject };
