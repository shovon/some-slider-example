"use client";

import { Graph } from "../components/Graph/Graph";

export default function Home() {
	return (
		<main className="h-screen bg-neutral-100">
			<nav className="bg-[#1c4756] text-white p-4">
				<strong>ClimateAi</strong>
			</nav>

			<div className="p-4">
				<div className="bg-white p-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]">
					<Graph />
				</div>
			</div>
		</main>
	);
}
