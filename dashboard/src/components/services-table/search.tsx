import { Table } from "@tanstack/react-table";
import { SearchInput } from "../search-input";
import { Service } from "@/types";

interface ServicesTableFiltersProps {
	table: Table<Service>;
	searchValue: string;
	onSearchChange: (value: string) => void;
}

export function ServicesTableSearch({
	table,
	searchValue,
	onSearchChange,
}: ServicesTableFiltersProps) {
	return (
		<div className="flex justify-center items-center space-x-2 w-full max-w-2xl mx-auto">
			<SearchInput
				value={searchValue}
				onChange={(value: string) => {
					onSearchChange(value);
					table.getColumn("name")?.setFilterValue(value);
				}}
				onClear={() => {
					table.setColumnFilters((prev) =>
						prev.filter((filter) => filter.id !== "name")
					);
					onSearchChange("");
				}}
			/>
		</div>
	);
}
