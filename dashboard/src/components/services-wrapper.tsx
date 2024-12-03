"use client";

import { useDebounceValue } from "usehooks-ts";
import { ServicesTable } from "./services-table";
import { Input } from "./ui/input";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export function ServicesWrapper() {
	const [searchInput, setSearchInput] = useState<string>("");
	const [debouncedValue] = useDebounceValue(searchInput, 350);

	return (
		<div className="justify-items-center space-y-4 mt-4">
			<div className="flex w-full justify-center items-center gap-2">
				<div className="w-full max-w-[400px] px-4 sm:px-0">
					<Input
						placeholder="Find a service..."
						type="search"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value.trim())}
						className="font-mono rounded-full p-6 bg-sidebar dark:bg-card focus:border-indigo-600 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
					/>
				</div>
				<ThemeToggle />
			</div>
			<ServicesTable searchValue={debouncedValue} />
		</div>
	);
}
