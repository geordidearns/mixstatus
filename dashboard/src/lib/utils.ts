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

const COOKIE_OPTIONS = {
	path: "/",
	maxAge: 60 * 60 * 24 * 365, // 1 year
} as const;

export function setCookie(name: string, value: string) {
	document.cookie = `${name}=${value}; path=${COOKIE_OPTIONS.path}; max-age=${COOKIE_OPTIONS.maxAge}`;
}

export function getCookie(name: string): string | undefined {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift();
	}
	return undefined;
}
