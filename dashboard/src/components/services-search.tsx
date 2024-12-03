"use client";

import { useDebounceValue } from "usehooks-ts";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";

interface ServicesSearchProps {
	onSearch: (value: string) => void;
}

export function ServicesSearch({ onSearch }: ServicesSearchProps) {
	const [searchInput, setSearchInput] = useState<string>("");
	const [debouncedValue] = useDebounceValue(searchInput, 350);

	// Effect to propagate debounced value to parent
	useEffect(() => {
		onSearch(debouncedValue);
	}, [debouncedValue, onSearch]);

	return (
		<Input
			placeholder="Find a service..."
			type="search"
			value={searchInput}
			onChange={(e) => setSearchInput(e.target.value.trim())}
			className="font-mono rounded-full p-6 bg-sidebar dark:bg-card focus:border-indigo-600 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
		/>
	);
}
