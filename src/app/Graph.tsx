"use client";

import { useRef, useState } from "react";
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

const sub2 = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
	[x1 - x2, y1 - y2] as [number, number];

const modulo = (a: number, m: number) => ((a % m) + m) % m;

// Straight up stolen from here https://stackoverflow.com/a/14415822/538570
const wrap = (x: number, min: number, max: number): number =>
	min > max ? wrap(x, max, min) : modulo(x - min, max - min) + min;

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

// The segment width, when no zooming is involved.
const segmentWidth = 100;

export function Graph() {
	const {
		width: divContainerWidth,
		// height: divContainerHeight,
		ref: divContainerRef,
	} = useResizeObserver();

	const cursorPositionRef = useRef<[number, number]>([0, 0]);

	// It's a logarithmic value, so the zoom factor grows at an exponential rate.
	const [zoom, setZoom] = useStateProcessor(0, (value) => Math.max(-3, value));
	const [pan, setPan] = useStateProcessor(
		0,
		(value) => Math.min(860, Math.max(0, value))
		// value
	);

	const height = 200;
	const phase = 0;
	const frequency = 0.006125126125;

	// In virtual space
	const domain = (x: number) => (x / sampleRate) * Math.PI;

	const widthSampleDivisor = 30;

	// Bunch of samples in virtual space.
	const samples = Array.from({
		length: Math.ceil(divContainerWidth / widthSampleDivisor) + 1,
	}).map((_, i) => {
		const x = i * widthSampleDivisor;
		return [
			x,
			Math.sin(((x + pan) * (frequency * 1) + 0) / Math.E ** zoom) * (20 * 1) +
				Math.sin(((x + pan) * (frequency * 2) + 1) / Math.E ** zoom) *
					(20 * 0.5) +
				Math.sin(((x + pan) * (frequency * 3) + 2) / Math.E ** zoom) *
					(20 * 0.25) +
				Math.E ** ((0.25 * (x + pan)) / Math.E ** zoom / 128) +
				50,
		];
	});

	// Pipe a bunch of iterators
	const path = start(samples)
		// ._((s) => slice(s, 0, samples.length - 1))
		._((s) =>
			map(s, ([x, yVirtual], i) => {
				const y = -yVirtual + height;

				if (i === 0) return `M${x} ${y}`;
				return `L${x} ${y}`;
			})
		);

	const modularZoomSegmentWidth =
		segmentWidth * Math.E ** wrap(zoom, -0.25, 0.25);
	const tickCount = Math.ceil(divContainerWidth / modularZoomSegmentWidth) * 2;

	return (
		<main ref={divContainerRef}>
			<p>
				Camera zoom: e<sup>{zoom}</sup> = {Math.E ** zoom}
			</p>
			<p>Camera pan: {pan}</p>
			<svg
				ref={(ref) => {
					ref?.addEventListener(
						"wheel",
						(e) => {
							e.preventDefault();
							if (e.ctrlKey) {
								const c1 = pan;
								const newZoom = zoom + -e.deltaY * 0.01;

								const z1 = Math.E ** zoom;
								const z2 = Math.E ** newZoom;

								const m = cursorPositionRef.current[0];

								setPan(((m + c1) / z1) * z2 - m);
								setZoom(newZoom);
							} else {
								setPan(pan + e.deltaX * 0.5);
							}
						},
						{ passive: false }
					);
				}}
				onMouseMove={(e) => {
					const rect = (e.target as Element)?.getBoundingClientRect() ?? {};
					const rectPos = [rect.left, rect.top] as [number, number];
					const clientXY = [e.clientX, e.clientY] as [number, number];

					cursorPositionRef.current = sub2(clientXY, rectPos);
				}}
				style={{
					width: divContainerWidth,
					height: height,
				}}
				className="border-y-black border-y-2"
			>
				<path d={[...path.value].join(" ")} stroke="blue" fill="transparent" />
				{/* <rect
					x={-pan}
					y={50}
					width={350 * Math.E ** zoom}
					height={200}
					style={{ background: "black" }}
				/> */}

				{Array.from({
					length: tickCount,
				}).map((_, i) => (
					<path
						key={i}
						d={`M${
							(i - Math.floor(tickCount / 2)) * modularZoomSegmentWidth -
							wrap(pan, -modularZoomSegmentWidth, modularZoomSegmentWidth)
						} 0 V ${height}`}
						stroke={"rgba(0, 0, 0, 0.125)"}
					/>
				))}
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
