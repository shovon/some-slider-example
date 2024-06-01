"use client";

import { Graph } from "../components/Graph/Graph";
import ZoomDIY from "../components/ZoomDIY";
import ZoomI from "../components/ZoomVisx";
import { useResizeObserver } from "../lib/resize";

export default function Home() {
	const zoomExample1 = useResizeObserver();
	const zoomExample2 = useResizeObserver();

	return (
		<main className="h-screen bg-neutral-100">
			<div className="p-4">
				<div className="bg-white p-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]">
					<Graph />
				</div>

				<div className="mt-4 bg-white p-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]">
					<div className="grid grid-cols-3 gap-4">
						<div>
							<h2 className="mb-4 text-2xl font-bold">Zoom examples</h2>
							<p>
								We have two similar examples, both using Visx, but each using
								their own strategy for implementing a {'"zoom"'} interaction.
							</p>
						</div>
						<div ref={zoomExample1.ref}>
							<h2 className="mb-4 text-2xl font-bold">Visx with Visx Zoom</h2>
							<ZoomI width={zoomExample1.width} height={300} />
						</div>
						<div ref={zoomExample2.ref}>
							<h2 className="mb-4 text-2xl font-bold">Visx; no Visx Zoom</h2>
							<ZoomDIY width={zoomExample2.width} height={300} />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
