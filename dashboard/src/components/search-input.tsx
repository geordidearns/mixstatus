import * as React from "react";
import { XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { memo, useCallback } from "react";

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
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			onChange(event.target.value);
		},
		[onChange]
	);

	return (
		<div className="relative w-full sm:max-w-[400px]">
			<Input
				placeholder={placeholder}
				type="search"
				value={value}
				onChange={handleChange}
				className="rounded-full p-6 pr-8 bg-card focus:border-indigo-600 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
			/>
			{value && (
				<div className="absolute inset-y-0 right-0 flex items-center pr-6">
					<button
						onClick={onClear}
						type="button"
						className="text-gray-400 hover:text-gray-600 focus:outline-none"
					>
						<XIcon className="h-4 w-4" />
					</button>
				</div>
			)}
		</div>
	);
});
