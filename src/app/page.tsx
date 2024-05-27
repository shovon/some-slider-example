"use client";

import { useState } from "react";
import { useResizeObserver } from "../lib/resize";
import { useStateConstraint } from "./useStateConstraint";
import { useStateProcessor } from "./useStateProcessor";

const amplitude = 1;
const sampleRate = 50;

function* map<T, V>(
	iterable: Iterable<T>,
	f: (v: T, index: number) => V
): Iterable<V> {
	let i = 0;
	for (const el of iterable) {
		yield f(el, i);
		i++;
	}
}

// function* slice<T>(
// 	iterable: Iterable<T>,
// 	start: number,
// 	end: number
// ): Iterable<T> {
// 	start = Math.max(0, start);
// 	end = Math.max(0, end);

// 	if (start > end) {
// 		yield* slice(iterable, end, start);
// 		return;
// 	}

// 	for (let i = 0; i < end; i++) {
// 		if (i < start) continue;
// 		for (const el of iterable) {
// 			yield el;
// 			i++;
// 		}
// 	}
// }

type Pipe<T> = {
	_<V>(fn: (value: T) => V): Pipe<V>;
	readonly value: T;
};

function start<T>(initial: T): Pipe<T> {
	return {
		_: (fn) => start(fn(initial)),
		get value() {
			return initial;
		},
	};
}

// From 0 to maxRange!
const maxRange = 500;

export default function Home() {
	const {
		width: divContainerWidth,
		// height: divContainerHeight,
		ref: divContainerRef,
	} = useResizeObserver();

	// It's a logarithmic value, so the zoom factor grows at an exponential rate.
	const [zoom, setZoom] = useStateProcessor(0, (value) =>
		Math.min(2, Math.max(-3, value))
	);
	const [pan, setPan] = useStateProcessor(0, (value) =>
		Math.min(100, Math.max(0, value))
	);

	const height = 200;
	const phase = 0;
	const frequency = 0.06125;

	// In virtual space
	const domain = (x: number) => (x / sampleRate) * Math.PI;

	// Bunch of samples in virtual space.
	const samples = Array.from({ length: Math.ceil(divContainerWidth) }).map(
		(_, i) => {
			const x = domain(i);
			return [
				x,
				Math.sin(domain(x) / Math.E ** zoom + domain(pan) * Math.E ** zoom),
			];
		}
	);

	// Pipe a bunch of iterators
	const path = start(samples)
		// ._((s) => slice(s, 0, samples.length - 1))
		._((s) =>
			map(s, ([xVirtual, yVirtual], i) => {
				const x = (xVirtual * sampleRate) / Math.PI;
				const y = -yVirtual * height * 0.5 * 0.8 + height / 2;

				if (i === 0) return `M${x} ${y}`;
				return `L${x} ${y}`;
			})
		);

	return (
		<main ref={divContainerRef}>
			<p>
				Camera zoom: e
				<sup>
					{zoom} = {Math.E ** zoom}
				</sup>
			</p>
			<p>Camera pan: {pan}</p>
			<svg
				ref={(ref) => {
					ref?.addEventListener(
						"wheel",
						(e) => {
							e.preventDefault();
							if (e.ctrlKey) {
								setZoom(zoom - e.deltaY * 0.01);
							} else {
								setPan(pan + (e.deltaX * 0.5) / Math.E ** zoom);
							}
						},
						{ passive: false }
					);
				}}
				style={{
					width: divContainerWidth,
					height: height,
				}}
				className="border-b-black border-b-2"
			>
				{/* <path d={[...path.value].join(" ")} stroke="blue" fill="transparent" /> */}
				<rect
					x={200 - pan * Math.E ** zoom}
					y={50}
					width={100 * Math.E ** zoom}
					height={100}
					style={{ background: "black" }}
				/>
			</svg>
			{/* <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
				<path
					d="
    M 50 50
    Q 100 0 150 50
    Q 200 100 250 50
    Q 300 0 350 50
    "
					stroke="black"
					fill="transparent"
				/>
			</svg> */}
		</main>
	);
}
