import { ReactNode, createContext, useEffect, useRef, useState } from "react";

export function useResizeObserver() {
	const ref = useRef(null);
	const [width, setWidth] = useState(NaN);
	const [height, setHeight] = useState(NaN);

	useEffect(() => {
		if (ref.current !== null) {
			const current = ref.current;
			const observer = new ResizeObserver((entries) => {
				if (entries.length <= 0) {
					return;
				}

				setWidth(entries[0].contentRect.width);
				setHeight(entries[0].contentRect.height);
			});

			observer.observe(current);

			return () => {
				observer.disconnect();
			};
		}
	}, []);

	return { width, height, ref };
}

const ResizeContext = createContext(NaN);

export function ResizeProvider({
	children,
	...props
}: { children: () => ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
	const mainRef = useRef<HTMLElement | null>(null);
	const [width, setWidth] = useState(NaN);
	const [height, setHeight] = useState(NaN);

	useEffect(() => {
		if (mainRef.current) {
			const current = mainRef.current;
			const observer = new ResizeObserver((mutationsList) => {
				if (mutationsList.length !== 1) {
					console.error("There are more than one element being observerved");
				}
				setWidth(mutationsList[0].contentRect.width);
			});

			observer.observe(current);

			return () => {
				observer.disconnect();
			};
		}

		return () => {};
	}, []);

	return (
		<div
			{...props}
			ref={(e) => {
				if (mainRef.current === null && e !== null) {
					mainRef.current = e;
					setWidth(mainRef.current.clientWidth);
				}
			}}
		>
			{children}
		</div>
	);
}
