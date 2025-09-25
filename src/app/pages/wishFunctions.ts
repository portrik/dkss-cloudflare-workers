"use server";

import { requestInfo } from "rwsdk/worker";
import { HTTP_STATUS } from "@/const";
import { db, type Wish } from "@/db";

const addWish = async (wish: string): Promise<void> => {
	const { ctx: context } = requestInfo;

	if (context.user == null) {
		throw new Response(null, { status: HTTP_STATUS.unauthorized });
	}

	await db.wish.create({
		data: {
			content: wish,
			userId: context.user.id,
		},
	});
};

const makeAWishComeTrue = async (): Promise<Wish | null> => {
	const { ctx: context } = requestInfo;

	if (context.user == null) {
		throw new Response(null, { status: HTTP_STATUS.unauthorized });
	}

	const wish = await db.wish.findFirst({
		where: {
			deletedAt: null,
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	if (wish != null) {
		await db.wish.update({
			where: {
				id: wish.id,
			},
			data: {
				deletedAt: new Date(),
			},
		});
	}

	return wish;
};

export { addWish, makeAWishComeTrue };
