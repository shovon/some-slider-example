"use client";

import { Graph } from "./Graph";

export default function Home() {
	return (
		<main className="h-screen bg-neutral-100">
			<nav className="bg-[#1c4756] text-white p-4">
				<strong>ClimateAi</strong>
			</nav>

			<div className="p-4">
				<div className="bg-white p-4">
					<Graph />
				</div>
			</div>
		</main>
	);
}
