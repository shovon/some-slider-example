import { array } from "vectorious";

export const translation = (x: number, y: number) =>
	array([
		[1, 0, x],
		[0, 1, y],
		[0, 0, 1],
	]);

export const scaling = (x: number, y: number) =>
	array([
		[x, 0, 0],
		[0, y, 0],
		[0, 0, 1],
	]);
