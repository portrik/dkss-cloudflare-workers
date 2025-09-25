import type { FC, PropsWithChildren } from "react";
import stylesUrl from "./styles.css?url";

const Document: FC<PropsWithChildren> = ({ children }) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
			<meta name="theme-color" content="#ff6b35" />
			<meta
				name="description"
				content="DKSS Cloudflare Worker - A modern wishes application with passkey authentication"
			/>

			<title>DKSS Wishes - Cloudflare Worker</title>

			<link rel="modulepreload" href="/src/client.tsx" />
			<link rel="stylesheet" href={stylesUrl} />
		</head>

		<body>
			{/** biome-ignore lint/correctness/useUniqueElementIds: Root has to be static */}
			<div id="root">{children}</div>

			<script>import("/src/client.tsx")</script>
		</body>
	</html>
);

export { Document };
