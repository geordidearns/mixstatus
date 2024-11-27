"use client";

import { useDebounceValue } from "usehooks-ts";
import { SearchInput } from "./search-input";
import { ServicesTable } from "./services-table";
import { useState } from "react";

export function ServicesWrapper() {
	const [searchInput, setSearchInput] = useState<string>("");
	const [debouncedValue] = useDebounceValue(searchInput, 300);

	return (
		<div className="space-y-8">
			<SearchInput
				value={searchInput}
				onChange={(value: string) => {
					setSearchInput(value.trim());
				}}
				onClear={() => {
					setSearchInput("");
				}}
			/>
			<ServicesTable searchValue={debouncedValue} />
		</div>
	);
}
