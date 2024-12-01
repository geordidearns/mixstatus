"use client";

import { useDebounceValue } from "usehooks-ts";
import { ServicesTable } from "./services-table";
import { Input } from "./ui/input";
import { useState } from "react";

export function ServicesWrapper() {
	const [searchInput, setSearchInput] = useState<string>("");
	const [debouncedValue] = useDebounceValue(searchInput, 350);

	return (
		<div className="space-y-8">
			<div className="sm:max-w-[400px]">
				<Input
					placeholder="Find a service..."
					type="search"
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value.trim())}
					className="rounded-full p-6 pr-8 bg-card focus:border-indigo-600 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
				/>
			</div>
			<ServicesTable searchValue={debouncedValue} />
		</div>
	);
}
