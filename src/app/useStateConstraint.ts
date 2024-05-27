import { useState } from "react";

export function useStateConstraint<T>(
	initialValue: T,
	predicate: (value: T) => boolean
): [T, (value: T) => void] {
	const [value, setValue] = useState(initialValue);
	return [
		value,
		(value: T) => {
			if (predicate(value)) {
				setValue(value);
			}
		},
	];
}
