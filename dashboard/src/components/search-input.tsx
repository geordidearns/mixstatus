import * as React from "react";
import { XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChangeEvent, memo, useCallback } from "react";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	onClear: () => void;
	placeholder?: string;
}

export const SearchInput = memo(function SearchInput({
	value,
	onChange,
	onClear,
	placeholder = "Search services...",
}: SearchInputProps) {
	const handleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onChange(event.target.value);
		},
		[onChange]
	);

	return (
		<div className="relative sm:max-w-[250px] sm:[&>input]:h-[32px]">
			<Input
				placeholder={placeholder}
				type="search"
				value={value}
				onChange={handleChange}
				className="rounded-sm pr-8 bg-card [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-600 focus:outline-none focus-visible:outline-none"
			/>
			<div className="absolute inset-y-0 right-0 flex items-center pr-2">
				{value && (
					<button
						onClick={onClear}
						className="text-gray-400 hover:text-gray-600 focus:outline-none"
					>
						<XIcon className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
});
