"use client";

import * as React from "react";
import {
	ColumnDef,
	SortingState,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FacetedFilter } from "./status-facet-filter";
import { Service } from "@/types";
import { ServiceCard } from "../service-card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
	getServicesAndEvents,
	groupServiceEvents,
} from "@/queries/get-services";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "@/lib/infinite-scroll";

import { createDashboard, updateDashboard } from "@/actions/create-dashboard";
import { SelectedServicesToast } from "../selected-services-toast";
import { Switch } from "../ui/switch";
import { SearchInput } from "../search-input";

export const columns: ColumnDef<Service>[] = [
	{
		accessorKey: "name",
		filterFn: (row, _id, filterValue) => {
			return row.original.name
				.toLowerCase()
				.includes((filterValue as string).toLowerCase());
		},
	},
	{
		accessorKey: "status",
		filterFn: (row, _id, filterValue) => {
			const service: Service = row.original;
			const hasOngoingEvent = service.service_events.some((serviceEvent) =>
				serviceEvent.events.some((event) => event.status === "ongoing")
			);
			const status = hasOngoingEvent ? "disruption" : "operational";
			return (filterValue as string[]).includes(status);
		},
	},
];

export function ServicesTable() {
	const supabase = createClient();
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [activeToastId, setActiveToastId] = useState<string | null>(null);
	const [searchValue, setSearchValue] = useState<string>("");
	const [isCreatingDashboard, setCreatingDashboard] = useState<boolean>(false);
	const [dashboardId, setDashboardId] = useState<string>("");
	const [isUpdatingDashboard, setUpdatingDashboard] = useState<boolean>(false);
	const [shouldUpdateDashboard, setShouldUpdateDashboard] =
		useState<boolean>(false);
	const [originalDashboardServices, setOriginalDashboardServices] = useState<
		string[]
	>([]);

	const {
		isLoading,
		isError,
		error,
		data,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = useInfiniteQuery({
		queryKey: ["services-and-events", 1],
		queryFn: ({ pageParam }: { pageParam: number }) =>
			getServicesAndEvents(supabase, pageParam),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage: number | undefined = lastPage?.length
				? allPages?.length
				: undefined;

			return nextPage;
		},
	});

	useEffect(() => {
		if (isError && error) {
			toast.error("Failed to fetch services", {
				description:
					error instanceof Error ? error.message : "An unknown error occurred",
			});
		}
	}, [isError, error]);

	const groupedServiceEvents = useMemo(() => {
		if (!data) return [];
		return groupServiceEvents(data.pages.flat());
	}, [data]);

	const clearSelectionToast = useCallback(() => {
		setRowSelection({});
		if (activeToastId) {
			toast.dismiss(activeToastId);
			setActiveToastId(null);
		}
	}, [activeToastId]);

	const handleCreateDashboard = useCallback(async () => {
		setCreatingDashboard(true);
		const selectedServiceIds = Object.keys(rowSelection);

		if (selectedServiceIds.length > 0) {
			try {
				const dashboardId = await createDashboard(selectedServiceIds);
				setOriginalDashboardServices(selectedServiceIds);
				setDashboardId(dashboardId);
				setCreatingDashboard(false);
			} catch (error) {
				console.error("Error creating dashboard:", error);
				toast.error("Failed to create dashboard");
			} finally {
				setCreatingDashboard(false);
			}
		} else {
			toast.error("Please select at least one service");
		}
	}, [rowSelection]);

	const handleUpdateDashboard = useCallback(async () => {
		const selectedServiceIds = Object.keys(rowSelection);
		setUpdatingDashboard(true);

		try {
			await updateDashboard(dashboardId, selectedServiceIds);
		} catch (error) {
			console.error("Error updating dashboard:", error);
			toast.error("Failed to update dashboard");
		} finally {
			setDashboardId(dashboardId);
			setShouldUpdateDashboard(false);
			setUpdatingDashboard(false);
		}
	}, [rowSelection, dashboardId]);

	useEffect(() => {
		const selectedCount = Object.keys(rowSelection).length;

		if (selectedCount > 0) {
			const firstSelectedId = Object.keys(rowSelection)[0];
			const firstSelectedService = groupedServiceEvents.find(
				(service) => service.id === firstSelectedId
			);

			const toastContent = (
				<SelectedServicesToast
					firstSelectedService={firstSelectedService?.name ?? ""}
					selectedCount={selectedCount}
					activeToastId={activeToastId}
					isCreating={isCreatingDashboard}
					shouldUpdate={shouldUpdateDashboard}
					isUpdating={isUpdatingDashboard}
					onClear={clearSelectionToast}
					onCreate={handleCreateDashboard}
					onUpdate={handleUpdateDashboard}
					dashboardId={dashboardId}
				/>
			);

			const toastId = toast(toastContent, {
				id: activeToastId || undefined,
				duration: Infinity,
			}) as string;

			if (!activeToastId) {
				setActiveToastId(toastId);
			}
		} else if (activeToastId) {
			toast.dismiss(activeToastId);
			setActiveToastId(null);
		}
	}, [
		rowSelection,
		activeToastId,
		isCreatingDashboard,
		clearSelectionToast,
		handleCreateDashboard,
		groupedServiceEvents,
		dashboardId,
		handleUpdateDashboard,
		isUpdatingDashboard,
		shouldUpdateDashboard,
	]);

	const getSelectedServices = useCallback(() => {
		return Object.keys(rowSelection).map(
			(index) => groupedServiceEvents[parseInt(index)]
		);
	}, [rowSelection, groupedServiceEvents]);

	useEffect(() => {
		getSelectedServices();
	}, [rowSelection, getSelectedServices]);

	const handleSelectionChange = useCallback(
		(id: string, checked: boolean) => {
			if (dashboardId) {
				setRowSelection((prev) => {
					const newSelection = { ...prev };
					if (checked) {
						newSelection[id] = true;
					} else {
						delete newSelection[id];
					}

					// Compare new selection with original dashboard services
					const newSelectedServices = Object.keys(newSelection);
					const hasSameServices =
						newSelectedServices.length === originalDashboardServices.length &&
						newSelectedServices.every((id) => originalDashboardServices.includes(id));

					setShouldUpdateDashboard(!hasSameServices);
					return newSelection;
				});
			} else {
				setRowSelection((prev) => {
					const newSelection = { ...prev };
					if (checked) {
						newSelection[id] = true;
					} else {
						delete newSelection[id];
					}
					return newSelection;
				});
			}
		},
		[dashboardId, originalDashboardServices]
	);

	const table = useReactTable({
		data: groupedServiceEvents,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		onSortingChange: (updater) => {
			setSorting((prev) => {
				const next = typeof updater === "function" ? updater(prev) : updater;
				return next;
			});
		},
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			rowSelection,
			sorting,
			columnFilters,
		},
	});

	return (
		<div className="rounded mx-auto space-y-8 font-sans">
			<div className="flex items-center space-x-2">
				<SearchInput
					value={searchValue}
					onChange={(value) => {
						setSearchValue(value);
						table.getColumn("name")?.setFilterValue(value);
					}}
					onClear={() => {
						table.setColumnFilters((prev) =>
							prev.filter((filter) => filter.id !== "name")
						);
						setSearchValue("");
					}}
				/>

				{table.getColumn("status") && (
					<FacetedFilter
						column={table.getColumn("status")}
						title="Status"
						options={[
							{ label: "Operational", value: "operational" },
							{ label: "Disruption", value: "disruption" },
						]}
					/>
				)}
			</div>
			<InfiniteScroll
				isLoadingIntial={isLoading}
				isLoadingMore={isFetchingNextPage}
				loadMore={() => hasNextPage && fetchNextPage()}
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
					{table.getRowModel().rows.map((row) => {
						return (
							<ServiceCard
								key={row.original.id}
								id={row.original.id}
								name={row.original.name}
								domain={row.original.domain}
								events={row.original.service_events}
								className={cn(
									"transition-all",
									rowSelection[row.original.id] && "border-indigo-600"
								)}
								action={{
									component: (
										<Switch
											className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:text-gray-400"
											checked={!!rowSelection[row.original.id]}
											onCheckedChange={(checked) =>
												handleSelectionChange(row.original.id, checked)
											}
										/>
									),
								}}
							/>
						);
					})}
				</div>
			</InfiniteScroll>
		</div>
	);
}
