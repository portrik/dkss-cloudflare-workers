// biome-ignore lint/correctness/noNodejsModules: Should be good to go
import process from "node:process";
import { initClient } from "rwsdk/client";

initClient().catch((error: unknown) => {
	// biome-ignore-start lint/suspicious/noConsole: It is what it is
	console.error(error);
	console.error("Failed to initialize the client");
	// biome-ignore-end lint/suspicious/noConsole: It is what it is

	process.exit(1);
});
