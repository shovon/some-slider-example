import { useState } from "react";

export function useStateProcessor<T>(
	initialValue: T,
	processor: (value: T) => T
): [T, (value: T) => void] {
	const [value, setValue] = useState(initialValue);
	return [
		value,
		(value: T) => {
			setValue(processor(value));
		},
	];
}
