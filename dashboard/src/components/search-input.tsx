import * as React from "react";
import { XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { memo } from "react";

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
	placeholder = "Find a service...",
}: SearchInputProps) {
	return (
		<div className="relative w-full  sm:max-w-[400px] sm:[&>input]:h-[32px]">
			<Input
				placeholder={placeholder}
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="rounded-full p-6 pr-8 bg-card [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-600 focus:outline-none focus-visible:outline-none"
			/>
			<div className="absolute inset-y-0 right-0 flex items-center pr-6">
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
