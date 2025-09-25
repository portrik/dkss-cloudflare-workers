import { defineDurableSession } from "rwsdk/auth";

const createSessionStore = (env: Env) =>
	defineDurableSession({
		sessionDurableObject: env.SESSION_DURABLE_OBJECT,
	});

let sessions: ReturnType<typeof createSessionStore>;

const setupSessionStore = (env: Env): ReturnType<typeof createSessionStore> => {
	sessions = createSessionStore(env);

	return sessions;
};

export { sessions, setupSessionStore };
