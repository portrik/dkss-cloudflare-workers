const HTTP_STATUS = {
	found: 302,

	unauthorized: 401,
} as const satisfies Record<string, number>;

export { HTTP_STATUS };
