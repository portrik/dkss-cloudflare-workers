"use client";

import type { RouteDefinition } from "rwsdk/router";
import type { RequestInfo } from "rwsdk/worker";
import { useId, useState, useTransition } from "react";
import { addWish, makeAWishComeTrue } from "./wishFunctions";

const Wishes = (() => {
	const wishInputId = useId();
	const [fulfilledWishes, setFulfilledWishes] = useState<string[]>([]);
	const [wish, setWish] = useState("");
	const [actionStatus, setActionStatus] = useState("");
	const [isPending, startTransition] = useTransition();

	const handleAddWish = () => {
		startTransition(() =>
			addWish(wish)
				.then(() => {
					setActionStatus("Wish added successfully.");
					setWish("");
				})
				.catch((_error: unknown) => {
					// Log error for debugging

					setActionStatus("Could not add the wish due to an error.");
				}),
		);
	};

	const handleMakeAWishComeTrue = () => {
		startTransition(() =>
			makeAWishComeTrue()
				.then((newWish) => {
					const content = newWish != null ? newWish.content : "There are no more wishes available...";

					setFulfilledWishes((previous) => previous.concat(content));
				})
				.catch(() => {
					setFulfilledWishes((previous) => previous.concat("Could not fulfill the wish due to an error."));
				}),
		);
	};

	return (
		<div className="page-container" style={{ width: "100vw", padding: "0", margin: "0", height: "100%" }}>
			<header
				className="wishes-header"
				style={{
					padding: "1rem 2rem",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100vw",
					boxSizing: "border-box",
				}}
			>
				<h1>Wishes</h1>
				<a href="/logout" className="nav-link">
					Logout
				</a>
			</header>

			<main
				className="wishes-grid"
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 2fr",
					gap: "2rem",
					padding: "2rem",
					width: "100vw",
					boxSizing: "border-box",
				}}
			>
				<section className="make-wish-section section" style={{ display: "flex", flexDirection: "column" }}>
					<div className="card fade-in" style={{ height: "fit-content", padding: "2rem" }}>
						<h2>Make a New Wish</h2>

						<form onSubmit={(e) => e.preventDefault()}>
							<div className="form-group">
								<label htmlFor={wishInputId} className="form-label">
									What do you wish for?
								</label>
								<input
									id={wishInputId}
									type="text"
									value={wish}
									onChange={(event) => setWish(event.target.value)}
									placeholder="I wish for..."
									autoComplete="off"
								/>
							</div>

							{actionStatus.length > 0 && (
								<div
									className={`status-message ${(() => {
										if (actionStatus.includes("successfully")) {
											return "status-success";
										}
										if (actionStatus.includes("error")) {
											return "status-error";
										}
										return "status-info";
									})()}`}
								>
									{actionStatus}
								</div>
							)}

							<button
								type="button"
								onClick={handleAddWish}
								disabled={isPending || !wish.trim()}
								className={`btn btn-primary ${isPending ? "loading" : ""}`}
							>
								{isPending ? "Saving..." : "Save a Wish"}
							</button>
						</form>
					</div>
				</section>

				<section className="fulfill-wish-section section" style={{ display: "flex", flexDirection: "column" }}>
					<div className="card fade-in" style={{ height: "fit-content", padding: "2rem", flex: "1" }}>
						<h2>Make a Wish Come True</h2>

						<p className="form-label">Click the button below to fulfill a random wish</p>

						<button
							type="button"
							onClick={handleMakeAWishComeTrue}
							disabled={isPending}
							className={`btn btn-secondary ${isPending ? "loading" : ""}`}
						>
							{isPending ? "Finding a wish..." : "Fulfill a Wish"}
						</button>

						{fulfilledWishes.length > 0 && (
							<div className="wishes-list" style={{ marginTop: "2rem", maxHeight: "60vh", overflowY: "auto" }}>
								<h3 className="form-label">Fulfilled Wishes:</h3>
								{fulfilledWishes.map((fulfilledWish, index) => (
									<div
										key={`${fulfilledWish}-${String(index)}`}
										className="wish-item fade-in"
										style={{
											padding: "1rem",
											marginBottom: "1rem",
											backgroundColor: "rgba(255, 255, 255, 0.05)",
											borderRadius: "8px",
											lineHeight: "1.6",
										}}
									>
										{fulfilledWish}
									</div>
								))}
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}) satisfies RouteDefinition<RequestInfo>["handler"];

export { Wishes };
