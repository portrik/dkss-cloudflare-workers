import type { Session } from "@/session/durableObject";
import { env } from "cloudflare:workers";
import { type Route, render, route } from "rwsdk/router";
import { defineApp, ErrorResponse, type RequestInfo } from "rwsdk/worker";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { Login } from "@/app/pages/Login";
import { Wishes } from "@/app/pages/Wishes";
import { HTTP_STATUS } from "@/const";
import { db, setupDb, type User } from "@/db";
import { sessions, setupSessionStore } from "@/session/store";

type AppContext = {
	session: Session | null;
	user: User | null;
};

const setupDbAndSession: Route<RequestInfo> = async ({ ctx: context, request, response }) => {
	await setupDb(env);
	setupSessionStore(env);

	try {
		context.session = await sessions.load(request);
	} catch (error: unknown) {
		if (!(error instanceof ErrorResponse) || error.code !== HTTP_STATUS.unauthorized) {
			throw error;
		}

		await sessions.remove(request, response.headers);
		response.headers.set("Location", "/login");

		return new Response(null, { status: HTTP_STATUS.found, headers: response.headers });
	}

	if (context.session?.userId != null) {
		context.user = await db.user.findUnique({
			where: {
				id: context.session.userId,
			},
		});
	}
};

const app = defineApp([
	setCommonHeaders(),
	setupDbAndSession,

	route("/logout", async ({ ctx: context, request, response }) => {
		await sessions.remove(request, response.headers);
		context.session = null;
		context.user = null;

		return new Response(null, {
			status: HTTP_STATUS.found,
			headers: { Location: "/login" },
		});
	}),

	render(Document, [
		route("/wishes", [
			(requestInfo) => {
				if (requestInfo.ctx.user == null) {
					return new Response(null, {
						status: HTTP_STATUS.found,
						headers: { Location: "/login" },
					});
				}
			},
			Wishes,
		]),

		route("/login", [
			(requestInfo) => {
				if (requestInfo.ctx.user != null) {
					return new Response(null, {
						status: HTTP_STATUS.found,
						headers: { Location: "/wishes" },
					});
				}
			},
			Login,
		]),
	]),
]);

// biome-ignore lint/style/noDefaultExport: RWSDK requirement
export default app;
export type { AppContext };

// Necessary to export here for Wrangler to discover the object and type the ENV correctly
export { SessionDurableObject } from "./session/durableObject";
