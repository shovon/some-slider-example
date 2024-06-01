import { ElementType, useCallback, useEffect, useRef, useState } from "react";

const scalarMul = (v: [number, number], c: number) =>
	[v[0] * c, v[1] * c] as [number, number];

const sub2 = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
	[x1 - x2, y1 - y2] as [number, number];

const add2 = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
	[x1 + x2, y1 + y2] as [number, number];

export function useCamera<E extends Element>() {
	const ref = useRef<E | null>(null);
	const cursorPositionRef = useRef<[number, number]>([0, 0]);
	const [camera, setCamera] = useState<{
		zoom: number;
		pan: [number, number];
	}>({
		zoom: 0,
		pan: [0, 0],
	});

	const onWheelListener = useCallback(
		(e: Event) => {
			if (e instanceof WheelEvent) {
				if (e.ctrlKey) {
					e.preventDefault();

					const newZoom = camera.zoom + -e.deltaY * 0.01;

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
			}
		},
		[camera]
	);

	useEffect(() => {
		const currentRef = ref.current;
		const listener = onWheelListener;
		currentRef?.addEventListener("wheel", listener);
		return () => {
			currentRef?.removeEventListener("wheel", listener);
		};
	}, [onWheelListener]);

	return {
		camera,
		ref,
		onMouseMove: (e: React.MouseEvent<E, MouseEvent>) => {
			const rect = e.currentTarget.getBoundingClientRect() ?? {};
			const rectPos = [rect.left, rect.top] as [number, number];
			const clientXY = [e.clientX, e.clientY] as [number, number];

			cursorPositionRef.current = sub2(clientXY, rectPos);
		},
	};
}
