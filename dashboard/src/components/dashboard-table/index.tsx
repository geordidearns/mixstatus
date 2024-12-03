"use client";

import * as React from "react";
import {
	ColumnDef,
	SortingState,
	getCoreRowModel,
	ColumnFiltersState,
	getSortedRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDashboardDetails } from "@/queries/get-services";
import { useQuery } from "@tanstack/react-query";
import { ServiceCard } from "../service-card";
import { cn } from "@/lib/utils";
import { SearchInput } from "../search-input";
import { Service } from "@/types";

export const columns: ColumnDef<Service>[] = [
	{
		accessorKey: "name",
	},
];

export function DashboardTable({ dashboardId }: { dashboardId: string }) {
	const supabase = createClient();
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [searchValue, setSearchValue] = useState<string>("");

	const { isError, error, data } = useQuery({
		queryKey: ["dashboard-services-and-events"],
		queryFn: () => getDashboardDetails(supabase, dashboardId),
	});

	useEffect(() => {
		if (isError && error) {
			toast.error("Failed to fetch services", {
				description:
					error instanceof Error ? error.message : "An unknown error occurred",
			});
		}
	}, [isError, error]);

	const memoizedServiceEvents = useMemo(() => {
		let filteredData;
		if (searchValue) {
			filteredData = data?.filter((service) =>
				service.name.toLowerCase().includes(searchValue.toLowerCase()),
			);
		}

		return filteredData;
	}, [data, searchValue]);

	const table = useReactTable({
		data: memoizedServiceEvents ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		onSortingChange: (updater) => {
			setSorting((prev) => {
				const next = typeof updater === "function" ? updater(prev) : updater;
				return next;
			});
		},
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			rowSelection,
			sorting,
			columnFilters,
		},
	});

	const clearSearch = useCallback(() => {
		setSearchValue("");
		table.getColumn("name")?.setFilterValue("");
	}, [table]);

	console.log({ data: table.getRowModel().rows[0] });

	return (
		<div className="rounded mx-auto space-y-8 font-sans">
			<div className="flex items-center space-x-2">
				<SearchInput
					value={searchValue}
					onChange={setSearchValue}
					onClear={clearSearch}
				/>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{table.getRowModel().rows.map((row) => (
					<ServiceCard
						key={row.original.id}
						id={row.original.id}
						name={row.original.name}
						domain={row.original.domain}
						service_events={row.original.service_events}
						className={cn(
							"transition-all",
							rowSelection[row.original.id] && "border-indigo-600",
						)}
					/>
				))}
			</div>
		</div>
	);
}
