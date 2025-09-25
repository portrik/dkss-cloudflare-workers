import { PrismaClient } from "@generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

let db: PrismaClient;

// context(justinvdm, 21-05-2025): We need to instantiate the client via a
// function rather that at the module level for several reasons:
// * For prisma-client-js generator or cases where there are dynamic import to
//   the prisma wasm modules, we need to make sure we are instantiating the
//   prisma client later in the flow when the wasm would have been initialized
// * So that we can encapsulate workarounds, e.g. see `SELECT 1` workaround
//   below
const setupDb = async (env: Env) => {
	db = new PrismaClient({
		adapter: new PrismaD1(env.DB),
	});

	// context(justinvdm, 21-05-2025): https://github.com/cloudflare/workers-sdk/pull/8283
	await db.$queryRaw`SELECT 1`;
};

export { db, setupDb };
export type * from "@generated/prisma/client";
export type * from "@generated/prisma/enums";
export type * from "@generated/prisma/models";
