import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// returns a range of numbers to be used for pagination.
export function getRange(page: number, limit: number) {
	const from = page * limit;
	const to = from + limit - 1;

	return [from, to];
}
