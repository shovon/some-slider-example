import { memo, useEffect, useRef } from "react";
import { useResizeObserver } from "../../lib/resize";

export type OnLeftSlideProps = {
	amount: number;
	segmentWidth: number;
	sliderWidth: number;
};

export type OnCenterSlideProps = {
	// This is movement in the x coordinate in pixel space
	amount: number;

	// This is the width of the segment in pixel space.
	segmentWidth: number;

	// This is the width of the slider in pixel space.
	sliderWidth: number;
};

export type OnRightSlideProps = {
	amount: number;
	segmentWidth: number;
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
	zoomRatio: number;

	onLeftSlide?: (props: OnLeftSlideProps) => void;
	onCenterSlide?: (props: OnCenterSlideProps) => void;
	onRightSlide?: (amount: OnRightSlideProps) => void;
};

export const Slider = memo(function Slider({
	panRatio,
	zoomRatio,
	onLeftSlide,
	onCenterSlide,
	onRightSlide,
}: SliderProps) {
	const {
		width: divContainerWidth,
		// height: divContainerHeight,
		ref: divContainerRef,
	} = useResizeObserver();
	const isMouseDownOnLeftRef = useRef(false);
	const isMouseDownOnCenterRef = useRef(false);
	const isMouseDownOnRightRef = useRef(false);

	useEffect(() => {
		const listener = (e: MouseEvent) => {
			const props = {
				amount: e.movementX,
				segmentWidth: zoomRatio * divContainerWidth,
				sliderWidth: divContainerWidth,
			};
			if (isMouseDownOnLeftRef.current) {
				// console.log("Left");
				e.preventDefault();
				onLeftSlide?.(props);
			}
			if (isMouseDownOnCenterRef.current) {
				// console.log("Center");
				e.preventDefault();
				onCenterSlide?.(props);
			}
			if (isMouseDownOnRightRef.current) {
				e.preventDefault();
				onRightSlide?.(props);
			}
		};
		document.addEventListener("mousemove", listener);
		return () => {
			document.removeEventListener("mousemove", listener);
		};
	}, [onCenterSlide, onLeftSlide, zoomRatio, divContainerWidth, onRightSlide]);

	useEffect(() => {
		const listener = () => {
			isMouseDownOnLeftRef.current = false;
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
				style={{
					left: panRatio * divContainerWidth,
					width: zoomRatio * divContainerWidth,
				}}
			></div>

			{/* The left knob */}
			<div
				className="cursor-pointer absolute left-0 top-[-2px] h-[16px] w-2 bg-[#1c4756]"
				style={{
					left: panRatio * divContainerWidth,
				}}
				onMouseDown={() => {
					isMouseDownOnLeftRef.current = true;
				}}
			></div>

			{/* The right knob */}
			<div
				className="cursor-pointer absolute left-0 top-[-2px] h-[16px] w-2 bg-[#1c4756]"
				style={{
					left: (panRatio + zoomRatio) * divContainerWidth,
				}}
				onMouseDown={() => {
					isMouseDownOnRightRef.current = true;
				}}
			></div>
		</div>
	);
});
