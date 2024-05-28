import { useEffect, useRef } from "react";
import { useResizeObserver } from "../../lib/resize";

type SliderProps = {
	left: number;
	right: number;
	onCenterSlide?: (props: {
		amount: number;
		segmentWidth;
		sliderWidth: number;
	}) => void;
	onRightSlide?: (amount: number) => void;
};

export function Slider({
	left,
	right,
	onCenterSlide,
	onRightSlide,
}: SliderProps) {
	const {
		width: divContainerWidth,
		// height: divContainerHeight,
		ref: divContainerRef,
	} = useResizeObserver();
	const isMouseDownOnCenterRef = useRef(false);
	const isMouseDownOnRightRef = useRef(false);

	useEffect(() => {
		const listener = (e: MouseEvent) => {
			if (isMouseDownOnCenterRef.current) {
				e.preventDefault();
				onCenterSlide?.({
					amount: e.movementX,
					segmentWidth: right * divContainerWidth,
					sliderWidth: divContainerWidth,
				});
			}
			if (isMouseDownOnRightRef.current) {
				e.preventDefault();
				onRightSlide?.(e.movementX);
			}
		};
		document.addEventListener("mousemove", listener);
		return () => {
			document.removeEventListener("mousemove", listener);
		};
	}, [onCenterSlide, right, divContainerWidth, onRightSlide]);

	useEffect(() => {
		const listener = () => {
			isMouseDownOnCenterRef.current = false;
			isMouseDownOnRightRef.current = false;
		};
		document.addEventListener("mouseup", listener);
		return () => {
			document.removeEventListener("mouseup", listener);
		};
	}, []);

	return (
		<div
			ref={divContainerRef}
			className="w-full h-[12px] bg-neutral-400 mt-4 relative"
		>
			{/* The white background indicating selection range */}
			<div
				className="cursor-grab absolute top-0 left-0 h-[12px] bg-neutral-100"
				onMouseDown={() => {
					isMouseDownOnCenterRef.current = true;
				}}
				onMouseUp={() => {
					isMouseDownOnCenterRef.current = false;
				}}
				style={{
					left: left * divContainerWidth,
					width: right * divContainerWidth,
				}}
			></div>

			{/* The left knob */}
			<div
				className="cursor-pointer absolute left-0 top-[-2px] h-[16px] w-2 bg-[#1c4756]"
				style={{
					left: left * divContainerWidth,
				}}
			></div>

			{/* The right knob */}
			<div
				className="cursor-pointer absolute left-0 top-[-2px] h-[16px] w-2 bg-[#1c4756]"
				style={{
					left: (left + right) * divContainerWidth,
				}}
				onMouseDown={() => {
					isMouseDownOnRightRef.current = true;
				}}
				onMouseUp={() => {
					isMouseDownOnRightRef.current = false;
				}}
			></div>
		</div>
	);
}
