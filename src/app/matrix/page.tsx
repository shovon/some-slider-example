"use client";

import { useState } from "react";
import { NDArray, NDIter, array } from "vectorious";
import { useCamera } from "../../lib/mouse-and-camera";
import { scaling, translation } from "../../lib/linear-algebra/homogeneous-2d";

const toString = (arr: NDArray) => {
	return new NDArray(arr.toArray().slice(0, -1))
		.transpose()
		.toArray()
		.flat()
		.join(" ");
};

const sub2 = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
	[x1 - x2, y1 - y2] as [number, number];

const modulo = (a: number, m: number) => ((a % m) + m) % m;

const wrap = (x: number, min: number, max: number): number =>
	min > max ? wrap(x, max, min) : modulo(x - min, max - min) + min;

const segmentWidth = 100;

export default function Matrix() {
	const [cursorPosition, setCursorPosition] = useState([0, 0]);

	const {
		camera,
		ref: svgElementRef,
		onMouseMove: onMouseMoveOnSVG,
	} = useCamera<SVGSVGElement>();

	const modularZoomSegmentWidth =
		segmentWidth * Math.E ** wrap(camera.zoom, -0.25, 0.25);

	const tickCount = Math.ceil(640 / modularZoomSegmentWidth) * 2 + 10;

	return (
		<div className="m-4">
			<div>
				<p>
					Cursor position: ({cursorPosition[0]}, {cursorPosition[1]})
				</p>
			</div>
			<svg
				ref={svgElementRef}
				onMouseMove={(e) => {
					const rect = e.currentTarget.getBoundingClientRect() ?? {};
					const rectPos = [rect.left, rect.top] as [number, number];
					const clientXY = [e.clientX, e.clientY] as [number, number];

					setCursorPosition(sub2(clientXY, rectPos));
					onMouseMoveOnSVG(e);
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
