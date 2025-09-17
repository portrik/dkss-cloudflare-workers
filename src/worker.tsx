import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/Home";

type AppContext = {};

const app = defineApp([
	setCommonHeaders(),
	({ ctx: context }) => {
		context;
	},
	render(Document, [route("/", Home)]),
]);

// biome-ignore lint/style/noDefaultExport: RWSDK requirement
export default app;
export type { AppContext };
