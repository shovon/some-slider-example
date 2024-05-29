import { memo, useEffect, useRef } from "react";
import { useResizeObserver } from "../../lib/resize";

export type OnCenterSliceProps = {
	// This is movement in the x coordinate in pixel space
	amount: number;

	// This is the width of the segment in pixel space.
	segmentWidth: number;

	// This is the width of the slider in pixel space.
	sliderWidth: number;
};

export type OnRightSlideProps = {
	amount: number;
	sliderWidth: number;
};

type SliderProps = {
	// A value between 0 to 1 representing how far away from the origin is the
	// left-most slider.
	//
	// Ideally left < right.
	panRatio: number;

	// A value between 0 to 1 representing how far away from the origin is the
	// right-most part of the slider.
	//
	// Ideally, right > left.
	right: number;

	onCenterSlide?: (props: OnCenterSliceProps) => void;
	onRightSlide?: (amount: OnRightSlideProps) => void;
};

export const Slider = memo(function Slider({
	panRatio: left,
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
				onRightSlide?.({ amount: e.movementX, sliderWidth: divContainerWidth });
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
});
