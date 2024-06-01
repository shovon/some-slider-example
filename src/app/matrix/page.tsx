"use client";

import { useEffect, useRef, useState } from "react";
import { NDArray, NDIter, array } from "vectorious";

const translation = (x: number, y: number) =>
	array([
		[1, 0, x],
		[0, 1, y],
		[0, 0, 1],
	]);

const scaling = (x: number, y: number) =>
	array([
		[x, 0, 0],
		[0, y, 0],
		[0, 0, 1],
	]);

type TreeNode<T> = {
	value: T;
	left: TreeNode<T>;
	right: TreeNode<T>;
};

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

const toString = (arr: NDArray) => {
	return (
		new NDArray(arr.toArray().slice(0, -1))
			.transpose()
			.toArray()
			// .map((el: number[]) => el.reverse())
			.flat()
			.join(" ")
	);
};

const sub2 = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
	[x1 - x2, y1 - y2] as [number, number];

const add2 = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
	[x1 + x2, y1 + y2] as [number, number];

const scalarMul = (v: [number, number], c: number) =>
	[v[0] * c, v[1] * c] as [number, number];

const modulo = (a: number, m: number) => ((a % m) + m) % m;

const wrap = (x: number, min: number, max: number): number =>
	min > max ? wrap(x, max, min) : modulo(x - min, max - min) + min;

const segmentWidth = 100;

export default function Matrix() {
	// const [cameraPan, setCameraPan] = useState<[number, number]>([0, 0]);
	// const [zoom, setZoom] = useState(0);
	const cursorPositionRef = useRef<[number, number]>([0, 0]);
	const [cursorPosition, setCursorPosition] = useState(
		cursorPositionRef.current
	);
	const [camera, setCamera] = useState<{
		zoom: number;
		pan: [number, number];
	}>({
		zoom: 0,
		pan: [0, 0],
	});

	const modularZoomSegmentWidth =
		segmentWidth * Math.E ** wrap(camera.zoom, -0.25, 0.25);

	const tickCount = Math.ceil(640 / modularZoomSegmentWidth) * 2 + 10;

	// console.log(cursorPositionRef.current);

	return (
		<div className="m-4">
			<div>
				<p>
					Cursor position: ({cursorPosition[0]}, {cursorPosition[1]})
				</p>
			</div>
			<svg
				ref={(ref) => {
					ref?.addEventListener(
						"wheel",
						(e) => {
							if (e.ctrlKey) {
								e.preventDefault();

								const c1 = camera.pan[0];
								const newZoom = camera.zoom + -e.deltaY * 0.01;

								const z1 = Math.E ** camera.zoom;
								const z2 = Math.E ** newZoom;

								const m = cursorPositionRef.current[0];

								const newPan = sub2(
									scalarMul(
										add2(cursorPositionRef.current, camera.pan),
										Math.E ** newZoom / Math.E ** camera.zoom
									),
									cursorPositionRef.current
								);

								setCamera({
									pan: newPan,
									zoom: newZoom,
								});
							} else {
								e.preventDefault();
								setCamera({
									pan: [camera.pan[0] + e.deltaX, camera.pan[1] + e.deltaY],
									zoom: camera.zoom,
								});
							}
						},
						{ passive: false }
					);
				}}
				onMouseMove={(e) => {
					const rect = e.currentTarget.getBoundingClientRect() ?? {};
					const rectPos = [rect.left, rect.top] as [number, number];
					const clientXY = [e.clientX, e.clientY] as [number, number];

					cursorPositionRef.current = sub2(clientXY, rectPos);

					setCursorPosition(cursorPositionRef.current);
				}}
				width={640}
				height={480}
				className="border-black border-2"
			>
				<g
					transform={`matrix(${toString(
						translation(-camera.pan[0], -camera.pan[1]).multiply(
							scaling(Math.E ** camera.zoom, Math.E ** camera.zoom)
						)
					)})`}
					// transform={`matrix(${toString(
					// 	translation(...camera.pan).multiply(
					// 		scaling(Math.E ** camera.zoom, Math.E ** camera.zoom)
					// 	)
					// )})`}
				>
					<circle cx={0} cy={0} r={10} fill="red" />
				</g>

				{Array.from({
					length: tickCount,
				}).map((_, i) => {
					const x =
						(i - Math.floor(tickCount / 2)) * modularZoomSegmentWidth -
						wrap(
							camera.pan[0],
							-modularZoomSegmentWidth,
							modularZoomSegmentWidth
						);
					return (
						<g key={i}>
							<path d={`M${x} 0 V ${480}`} stroke={"rgba(0, 0, 0, 0.125)"} />
							<text fill="rgba(0, 0, 0, 0.5)" x={x + 5} y={480 - 10}>
								{((camera.pan[0] + x) / Math.E ** camera.zoom).toFixed(2)}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
