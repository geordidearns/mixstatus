"use client";

import * as React from "react";
import {
	ColumnDef,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Service } from "@/types";
import { ServiceCard } from "../service-card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Radio, Server } from "lucide-react";
import {
	getOngoingDisruptions,
	getServicesAndEvents,
} from "@/queries/get-services";
import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import InfiniteScroll from "@/lib/infinite-scroll";
import { createDashboard, updateDashboard } from "@/actions/create-dashboard";
import { SelectedServicesToast } from "../selected-services-toast";
// import { Switch } from "../ui/switch";
import { OngoingIncidentCard } from "../ongoing-incident-card";
import { NoResultsFound } from "../results-not-found";

export const columns: ColumnDef<Service>[] = [
	{
		accessorKey: "name",
		filterFn: (row, _id, filterValue) => {
			if (!filterValue) return true;

			const name = row.original.name.toLowerCase();
			const filter = (filterValue as string).toLowerCase();

			return name.startsWith(filter);
		},
	},
	{
		accessorKey: "status",
		filterFn: (row, _id, filterValue) => {
			const service: Service = row.original;
			const hasOngoingEvent = service.service_events.some((serviceEvent) =>
				serviceEvent.events.some((event) => event.status === "ongoing"),
			);
			const status = hasOngoingEvent ? "disruption" : "operational";
			return (filterValue as string[]).includes(status);
		},
	},
];

interface ServicesTableProps {
	searchValue: string;
}

interface QueryKeys {
	services: ["services-and-events", string];
	disruptions: ["ongoing-disruptions", string];
}

function useServicesQueries(searchValue: string) {
	const supabase = createClient();

	const services = useSuspenseInfiniteQuery({
		queryKey: [
			"services-and-events",
			searchValue,
		] satisfies QueryKeys["services"],
		queryFn: ({ pageParam }: { pageParam: number }) =>
			getServicesAndEvents(supabase, pageParam, searchValue),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage?.length ? allPages.length : undefined,
		staleTime: 1000 * 60 * 5,
		retry: 2,
	});

	const disruptions = useSuspenseQuery({
		queryKey: [
			"ongoing-disruptions",
			searchValue,
		] satisfies QueryKeys["disruptions"],
		queryFn: () => getOngoingDisruptions(supabase, searchValue),
		staleTime: 1000 * 60 * 5,
		retry: 2,
	});

	return {
		services,
		disruptions,
		// Helper method to check if any query has errors
		hasErrors: services.isError || disruptions.isError,
		// Combined error messages
		errors: [services.error, disruptions.error].filter(Boolean),
	};
}

export function ServicesTable({ searchValue }: ServicesTableProps) {
	return <ServicesTableContent searchValue={searchValue} />;
}

export function ServicesTableContent({ searchValue }: ServicesTableProps) {
	// const supabase = createClient();
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [activeToastId, setActiveToastId] = useState<string | null>(null);
	const [isCreatingDashboard, setCreatingDashboard] = useState<boolean>(false);
	const [dashboardId, setDashboardId] = useState<string>("");
	const [isUpdatingDashboard, setUpdatingDashboard] = useState<boolean>(false);
	const [shouldUpdateDashboard, setShouldUpdateDashboard] =
		useState<boolean>(false);

	// const [originalDashboardServices, setOriginalDashboardServices] = useState<
	// 	string[]
	// >([]);

	const {
		services: {
			isLoading,
			data: servicesData,
			isFetchingNextPage,
			hasNextPage,
			fetchNextPage,
		},
		disruptions: { data: ongoingDisruptionsData },
		hasErrors,
		errors,
	} = useServicesQueries(searchValue);

	// const {
	// 	isLoading,
	// 	isError,
	// 	error,
	// 	data: servicesData,
	// 	isFetchingNextPage,
	// 	hasNextPage,
	// 	fetchNextPage,
	// } = useSuspenseInfiniteQuery({
	// 	queryKey: ["services-and-events", searchValue],
	// 	queryFn: ({ pageParam }: { pageParam: number }) =>
	// 		getServicesAndEvents(supabase, pageParam, searchValue),
	// 	initialPageParam: 0,
	// 	getNextPageParam: (lastPage, allPages) => {
	// 		const nextPage: number | undefined = lastPage?.length
	// 			? allPages?.length
	// 			: undefined;

	// 		return nextPage;
	// 	},
	// 	staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
	// 	retry: 2,
	// });

	// const {
	// 	data: ongoingDisruptionsData,
	// 	isError: isOngoingError,
	// 	error: ongoingError,
	// } = useSuspenseQuery({
	// 	queryKey: ["ongoing-disruptions", searchValue],
	// 	queryFn: () => getOngoingDisruptions(supabase, searchValue),
	// 	staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
	// 	retry: 2,
	// });

	useEffect(() => {
		if (hasErrors) {
			errors.forEach((error) => {
				toast.error("Failed to fetch data", {
					description:
						error instanceof Error
							? error.message
							: "An unknown error occurred",
				});
			});
		}
	}, [hasErrors, errors]);

	useEffect(() => {
		const apiKey = process.env.NEXT_PUBLIC_ABLY_SUBSCRIBE_ONLY_API_KEY;

		if (!apiKey) {
			console.error("Ably API key is not configured");
			return;
		}

		const url = `https://realtime.ably.io/event-stream?channels=services-updates&v=1.2&key=${apiKey}`;
		const eventSource = new EventSource(url);

		eventSource.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				// Invalidate the services query to trigger a refresh
				// You'll need to add your react-query queryClient here
				// queryClient.invalidateQueries({ queryKey: ['services-and-events'] });
				console.log({ message });
			} catch (error) {
				console.error("Error processing real-time update:", error);
			}
		};

		// Cleanup function
		return () => {
			eventSource.close();
		};
	}, []); // Empty dependency array since we only want to set this up once

	const allServices = useMemo(() => {
		const ongoingDisruptionIds = new Set(
			ongoingDisruptionsData?.map((service) => service.id),
		);

		// Filter out services that are already shown in ongoing disruptions
		return servicesData?.pages
			.flat()
			.filter((service) => !ongoingDisruptionIds.has(service.id));
	}, [ongoingDisruptionsData, servicesData]);

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
				// setOriginalDashboardServices(selectedServiceIds);
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
			const firstSelectedService = servicesData?.pages
				.flat()
				.find((service) => service.id === firstSelectedId);

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
		dashboardId,
		handleUpdateDashboard,
		isUpdatingDashboard,
		shouldUpdateDashboard,
		servicesData?.pages,
	]);

	const getSelectedServices = useCallback(() => {
		return Object.keys(rowSelection).map(
			(index) => servicesData?.pages.flat()[parseInt(index)],
		);
	}, [rowSelection, servicesData?.pages]);

	useEffect(() => {
		getSelectedServices();
	}, [rowSelection, getSelectedServices]);

	// const handleSelectionChange = useCallback(
	// 	(id: string, checked: boolean) => {
	// 		if (dashboardId) {
	// 			setRowSelection((prev) => {
	// 				const newSelection = { ...prev };
	// 				if (checked) {
	// 					newSelection[id] = true;
	// 				} else {
	// 					delete newSelection[id];
	// 				}

	// 				// Compare new selection with original dashboard services
	// 				const newSelectedServices = Object.keys(newSelection);
	// 				const hasSameServices =
	// 					newSelectedServices.length === originalDashboardServices.length &&
	// 					newSelectedServices.every((id) =>
	// 						originalDashboardServices.includes(id),
	// 					);

	// 				setShouldUpdateDashboard(!hasSameServices);
	// 				return newSelection;
	// 			});
	// 		} else {
	// 			setRowSelection((prev) => {
	// 				const newSelection = { ...prev };
	// 				if (checked) {
	// 					newSelection[id] = true;
	// 				} else {
	// 					delete newSelection[id];
	// 				}
	// 				return newSelection;
	// 			});
	// 		}
	// 	},
	// 	[dashboardId, originalDashboardServices],
	// );

	const table = useReactTable({
		data: allServices,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			rowSelection,
			columnFilters,
		},
	});

	const hasNoResults =
		!isLoading && allServices?.length === 0 && !ongoingDisruptionsData?.length;

	if (hasNoResults) {
		return <NoResultsFound searchValue={searchValue} />;
	}

	return (
		<div className="flex flex-col justify-center rounded mx-auto space-y-12 font-sans pt-4 sm:pt-0">
			{/* Ongoing disruptions */}
			{ongoingDisruptionsData?.length > 0 && (
				<div className="space-y-4">
					<h3 className="flex items-center text-xs uppercase font-mono font-semibold text-muted-foreground tracking-widest">
						<Radio className="mr-2 h-4 w-4 text-muted-foreground" />
						Ongoing disruptions
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{ongoingDisruptionsData.map((service) => (
							<OngoingIncidentCard
								{...service}
								key={service.id}
								service_events={service?.service_events}
								className={cn(
									"transition-all",
									rowSelection[service.id] && "border-indigo-600",
								)}
								// action={{
								// 	component: (
								// 		<Switch
								// 			className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:text-gray-400"
								// 			checked={!!rowSelection[service.id]}
								// 			onCheckedChange={(checked) =>
								// 				handleSelectionChange(service.id, checked)
								// 			}
								// 		/>
								// 	),
								// }}
							/>
						))}
					</div>
				</div>
			)}

			{/* All services */}
			{allServices?.length > 0 && (
				<div className="space-y-4">
					<h3 className="flex items-center text-xs uppercase font-mono font-semibold text-muted-foreground tracking-widest">
						<Server className="mr-2 h-4 w-4 text-muted-foreground" />
						All services
					</h3>

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
										service_events={row.original.service_events}
										className={cn(
											"transition-all",
											rowSelection[row.original.id] && "border-indigo-600",
										)}
										// action={{
										// 	component: (
										// 		<Switch
										// 			className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:text-gray-400"
										// 			checked={!!rowSelection[row.original.id]}
										// 			onCheckedChange={(checked) =>
										// 				handleSelectionChange(row.original.id, checked)
										// 			}
										// 		/>
										// 	),
										// }}
									/>
								);
							})}
						</div>
					</InfiniteScroll>
				</div>
			)}
		</div>
	);
}
