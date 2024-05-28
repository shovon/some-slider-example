"use client";

import { useRef, useState } from "react";
import { useResizeObserver } from "../lib/resize";
import { useStateConstraint } from "../app/useStateConstraint";
import { useStateProcessor } from "../app/useStateProcessor";

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

// The segment width, when no zooming is involved.
const segmentWidth = 100;
const zoomAddend = 5;
const maxVirtualRange = 80;

type Camera = {
	zoom: number;
	pan: number;
};

export function Graph() {
	const {
		width: divContainerWidth,
		// height: divContainerHeight,
		ref: divContainerRef,
	} = useResizeObserver();

	const cursorPositionRef = useRef<[number, number]>([0, 0]);

	// It's a logarithmic value, so the zoom factor grows at an exponential rate.
	const [{ pan: realPan, zoom: realZoom }, setCamera] =
		useStateProcessor<Camera>(
			{
				pan: 0,
				zoom: 0,
			},
			(value): Camera => {
				const minZoom = Math.log(divContainerWidth / maxVirtualRange);
				// virtualPan + divContainerWidth / Math.E ** virtualZoom < maxVirtualRange
				const maxPan =
					maxVirtualRange * Math.E ** (value.zoom + zoomAddend) -
					divContainerWidth;

				return {
					pan: Math.max(0, Math.min(maxPan, Math.max(0, value.pan))),
					zoom: Math.max(minZoom - zoomAddend, value.zoom),
				};
			}
		);
	const virtualZoom = realZoom + zoomAddend;
	const virtualPan = realPan / Math.E ** virtualZoom;

	const height = 200;

	const widthSampleDivisor = 10;

	// Bunch of samples in virtual space.
	const samples = Array.from({
		length: Math.ceil(divContainerWidth / widthSampleDivisor) + 1,
	}).map((_, i) => {
		const x = i * widthSampleDivisor;
		return [
			x,
			((Math.sin((x + realPan) / Math.E ** virtualZoom) * height) / 2) * 0.8,
			// Math.sin(((x + pan) * (frequency * 1) + 0) / Math.E ** virtualZoom) * (20 * 1) +
			// 	Math.sin(((x + pan) * (frequency * 2) + 1) / Math.E ** virtualZoom) *
			// 		(20 * 0.5) +
			// 	Math.sin(((x + pan) * (frequency * 3) + 2) / Math.E ** virtualZoom) *
			// 		(20 * 0.25) +
			// 	Math.E ** ((x + pan) / Math.E ** virtualZoom / spread) +
			// 	50,
		];
	});

	// Pipe a bunch of iterators
	const path = start(samples)
		// ._((s) => slice(s, 0, samples.length - 1))
		._((s) =>
			map(s, ([x, yVirtual], i) => {
				const y = -yVirtual + height / 2;

				if (i === 0) return `M${x} ${y}`;
				return `L${x} ${y}`;
			})
		);

	const modularZoomSegmentWidth =
		segmentWidth * Math.E ** wrap(virtualZoom, -0.25, 0.25);

	const tickCount =
		Math.ceil(divContainerWidth / modularZoomSegmentWidth) * 2 + 10;

	return (
		<div ref={divContainerRef}>
			<p>
				Camera zoom: e<sup>{virtualZoom}</sup> = {Math.E ** virtualZoom}
			</p>
			<p>Pan: {realPan}</p>
			<p>Simulated pan: {virtualPan}</p>
			<p>Container width: {divContainerWidth}</p>
			<p>Virtual end: {divContainerWidth / Math.E ** virtualZoom}</p>
			<p>
				Viewport range: {"["}
				{virtualPan}, {virtualPan + divContainerWidth / Math.E ** virtualZoom}
				{"]"}
			</p>
			<p>
				Allowed range: {"["}
				0, {maxVirtualRange}
				{"]"}. Is viewport outside range?{" "}
				{divContainerWidth / Math.E ** virtualZoom > maxVirtualRange ||
				virtualPan < 0 ||
				virtualPan + divContainerWidth / Math.E ** virtualZoom > maxVirtualRange
					? "Yes"
					: "No"}
			</p>
			<svg
				ref={(ref) => {
					ref?.addEventListener(
						"wheel",
						(e) => {
							e.preventDefault();
							if (e.ctrlKey) {
								const c1 = realPan;
								const newZoom = realZoom + -e.deltaY * 0.01;

								const z1 = Math.E ** virtualZoom;
								const z2 = Math.E ** (newZoom + zoomAddend);

								const m = cursorPositionRef.current[0];

								// setRealPan(();
								// setRealZoom(newZoom);
								setCamera({
									pan: ((m + c1) / z1) * z2 - m,
									zoom: newZoom,
								});
							} else {
								// setRealPan(realPan + e.deltaX * 0.5);
								setCamera({
									pan: realPan + e.deltaX * 0.5,
									zoom: realZoom,
								});
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
				<path
					d={[...path.value].join(" ")}
					stroke="rgb(206, 111, 49)"
					strokeWidth="2"
					fill="transparent"
				/>
				{/* <rect
					x={-pan}
					y={50}
					width={350 * Math.E ** virtualZoom}
					height={200}
					style={{ background: "black" }}
				/> */}

				{Array.from({
					length: tickCount,
				}).map((_, i) => {
					const x =
						(i - Math.floor(tickCount / 2)) * modularZoomSegmentWidth -
						wrap(realPan, -modularZoomSegmentWidth, modularZoomSegmentWidth);
					return (
						<g key={i}>
							<path d={`M${x} 0 V ${height}`} stroke={"rgba(0, 0, 0, 0.125)"} />
							<text fill="rgba(0, 0, 0, 0.5)" x={x + 5} y={height - 10}>
								{((realPan + x) / Math.E ** virtualZoom).toFixed(2)}
							</text>
						</g>
					);
				})}
			</svg>

			<div className="w-full h-[12px] bg-neutral-400 mt-4 relative">
				{/* The white background indicating selection range */}
				<div
					className="cursor-grab absolute top-0 left-0 h-[12px] bg-white"
					style={{
						width: 100,
					}}
				></div>

				{/* The left knob */}
				<div className="cursor-pointer absolute left-0 top-[-2px] h-[16px] w-2 bg-[#1c4756]"></div>

				{/* The right knob */}
				<div className="cursor-pointer absolute left-0 top-[-2px] h-[16px] w-2 bg-[#1c4756]"></div>
			</div>
		</div>
	);
}
