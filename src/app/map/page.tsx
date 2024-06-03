"use client";

import ReactMap from "react-map-gl/maplibre";

export default function MapExample() {
	return (
		<div className="w-full h-full">
			<ReactMap
				initialViewState={{
					longitude: -123.122637,
					latitude: 49.275638,
					zoom: 15,
				}}
				style={{ width: "100vw", height: "100vh" }}
				mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
			/>
		</div>
	);
}
