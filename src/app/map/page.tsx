"use client";

import { useRef, useState } from "react";
import ReactMap, { MapRef } from "react-map-gl/maplibre";
import { InferType, number, object, string, validate } from "hyperguard";
import "ldrs/ring";
import { useResizeObserver } from "../../lib/resize";
import toast from "react-hot-toast";

type CustomElement<T> = Partial<T & React.DOMAttributes<T> & { children: any }>;

declare global {
	namespace JSX {
		interface IntrinsicElements {
			["l-ring"]: CustomElement<unknown>;
		}
	}
}

const schema = object({
	latitude: number(),
	longitude: number(),
	zoom: number(),
});

export default function MapExample() {
	const mapRef = useRef<MapRef>(null);
	const {
		// width: divContainerWidth,
		height: divContainerHeight,
		ref: divContainerRef,
	} = useResizeObserver();

	const [searchBoxValue, setSearchBoxValue] = useState("");
	const [viewState, setViewState] = useState({
		longitude: -100,
		latitude: 40,
		zoom: 3.5,
	});
	const [isLoading, setIsLoading] = useState(false);

	async function lookup(query: string) {
		try {
			setIsLoading(true);
			const response = await fetch("/api/prompt", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: query }),
			});
			if (response.status >= 400) {
				throw new Error("Bad response");
			}
			setViewState(validate(schema, await response.json()));
		} catch {
			toast("Something went wrong. Please try again");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div
			ref={(ref) => {
				if (ref) {
					divContainerRef.current = ref.parentElement;
				}
			}}
			className="relative"
		>
			<ReactMap
				{...viewState}
				ref={mapRef}
				// initialViewState={{
				// 	latitude: 49.2827,
				// 	longitude: -123.1207,
				// 	zoom: 10,
				// }}
				onMove={(e) => setViewState(e.viewState)}
				style={{
					width: "100vw",
					height: divContainerHeight,
				}}
				mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
			/>

			<div className="absolute left-0 top-0 p-10 w-full">
				<input
					disabled={isLoading}
					value={searchBoxValue}
					onChange={(e) => {
						setSearchBoxValue(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							lookup(searchBoxValue);
						}
					}}
					placeholder="Look up a place here…"
					className="disabled:bg-neutral-400 text-neutral-700 inline-block w-full text-3xl px-5 py-3 rounded-full shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]"
					type="text"
				/>
			</div>
		</div>
	);
}
