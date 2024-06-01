import { NDArray } from "vectorious";

export const toString = (arr: NDArray) => {
	return new NDArray(arr.toArray().slice(0, -1))
		.transpose()
		.toArray()
		.flat()
		.join(" ");
};
