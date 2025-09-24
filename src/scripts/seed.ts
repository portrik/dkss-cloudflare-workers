import { defineScript } from "rwsdk/worker";
import { db, setupDb } from "@/db";

const script = defineScript(async ({ env }) => {
	await setupDb(env);

	await db.$executeRawUnsafe(`\
    DELETE FROM User;
    DELETE FROM sqlite_sequence;
  `);

	await db.user.create({
		data: {
			id: "1",
			username: "testuser",
		},
	});

	// biome-ignore lint/suspicious/noConsole: It is what it is
	console.log("🌱 Finished seeding");
});

// biome-ignore lint/style/noDefaultExport: RWSDK requirement
export default script;
