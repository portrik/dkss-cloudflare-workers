import type { FC } from "react";
import type { RequestInfo } from "rwsdk/worker";

const Home: FC<RequestInfo> = () => {
	if (!import.meta.env.VITE_IS_DEV_SERVER) {
		return <div>Hello World</div>;
	}

	return (
		<iframe
			title="RWSDK Start"
			style={{ width: "100%", height: "100%", border: "none" }}
			src="https://rwsdk.com/start"
		/>
	);
};

export { Home };
