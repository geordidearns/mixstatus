"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { getServiceBySlug } from "@/queries/get-service-by-slug";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Suspense, useState } from "react";
import { LoadingServices } from "./services-table/loading-services";
import Image from "next/image";
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Service, ServiceEvent } from "@/types";
import { Timeline } from "./event-timeline";
import {
	differenceInMinutes,
	endOfMonth,
	format,
	formatDistanceToNowStrict,
	parseISO,
	startOfMonth,
	subMonths,
} from "date-fns";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ServiceDetailsProps {
	slug: string;
}

type ChartView = "events" | "time";

// function getSeverityColor(severity: string): string {
// 	switch (severity.toLowerCase()) {
// 		case "critical":
// 			return "bg-red-500";
// 		case "major":
// 			return "bg-orange-500";
// 		case "minor":
// 			return "bg-yellow-500";
// 		case "maintenance":
// 			return "bg-blue-500";
// 		default:
// 			return "bg-muted";
// 	}
// }

const chartConfig = {
	maintenance: {
		label: "Maintenance",
		color: "rgb(var(--color-blue-500))", // Using Tailwind blue
	},
	minor: {
		label: "Minor",
		color: "rgb(var(--color-yellow-500))", // Using Tailwind yellow
	},
	major: {
		label: "Major",
		color: "rgb(var(--color-orange-500))", // Using Tailwind orange
	},
	critical: {
		label: "Critical",
		color: "rgb(var(--color-red-500))", // Using Tailwind red
	},
} satisfies ChartConfig;

function processServiceEvents(service: Service) {
	// Get the start of the 6-month range
	const startDate = startOfMonth(subMonths(new Date(), 6));

	// Create an array of the last 6 months
	const months = Array.from({ length: 6 }, (_, i) => {
		const date = subMonths(new Date(), 5 - i); // 5 - i to get ascending order
		return format(date, "MMM");
	});

	// Initialize data structure
	const monthlyData = months.map((month) => ({
		month,
		critical: 0,
		major: 0,
		minor: 0,
		maintenance: 0,
	}));

	// Process events
	service?.service_events.forEach((eventGroup) => {
		eventGroup?.events?.forEach((event) => {
			const eventDate = parseISO(event.created_at);

			// Only count events that occurred after startDate
			if (eventDate >= startDate && event?.severity) {
				const eventMonth = format(eventDate, "MMM");
				const monthData = monthlyData.find((data) => data.month === eventMonth);
				if (monthData) {
					const severity =
						event.severity.toLowerCase() as keyof typeof chartConfig;
					monthData[severity] += 1;
				}
			}
		});
	});

	return monthlyData;
}

function processServiceEventTimes(service: Service) {
	const startDate = startOfMonth(subMonths(new Date(), 6));

	// Create an array of the last 6 months with start/end dates for each month
	const monthlyData = Array.from({ length: 6 }, (_, i) => {
		const date = subMonths(new Date(), 5 - i);
		const monthStart = startOfMonth(date);
		const monthEnd = endOfMonth(date);
		const totalMinutesInMonth = differenceInMinutes(monthEnd, monthStart) + 1;

		return {
			month: format(date, "MMM"),
			totalMinutes: 0,
			totalMinutesInMonth,
			percentage: 0, // Will store percentage value
		};
	});

	// Process events
	service?.service_events.forEach((eventGroup) => {
		eventGroup?.events?.forEach((event) => {
			const eventDate = parseISO(event.created_at);

			if (eventDate >= startDate) {
				const eventMonth = format(eventDate, "MMM");
				const monthData = monthlyData.find((data) => data.month === eventMonth);

				if (monthData) {
					if (event.status === "ongoing") {
						const startTime = parseISO(event.original_pub_date);
						const timeInMinutes = Math.floor(
							(new Date().getTime() - startTime.getTime()) / (1000 * 60),
						);
						monthData.totalMinutes += timeInMinutes;
					} else if (event?.accumulated_time_minutes) {
						monthData.totalMinutes += event.accumulated_time_minutes;
					}
				}
			}
		});
	});

	// Calculate percentages
	monthlyData.forEach((data) => {
		data.percentage = Number(
			((data.totalMinutes / data.totalMinutesInMonth) * 100).toFixed(2),
		);
	});

	return monthlyData;
}

const getMostRecentOngoingEvent = (service: Service): ServiceEvent | null => {
	let mostRecentEvent: ServiceEvent | null = null;
	let mostRecentDate = new Date(0);

	service?.service_events.forEach((eventGroup) => {
		eventGroup?.events?.forEach((event) => {
			const eventDate = new Date(event.created_at);
			if (event.status === "ongoing" && eventDate > mostRecentDate) {
				mostRecentDate = eventDate;
				mostRecentEvent = event;
			}
		});
	});

	return mostRecentEvent;
};

export function ServiceDetails({ slug }: ServiceDetailsProps) {
	const [chartView, setChartView] = useState<ChartView>("events");

	const { data, isError } = useQuery({
		queryKey: ["service", slug],
		queryFn: async () => {
			const supabase = createClient();
			return getServiceBySlug(supabase, slug);
		},
		staleTime: 5 * 60 * 1000,
	});

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					Failed to load service details. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	if (!data) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Not Found</AlertTitle>
				<AlertDescription>
					The requested service could not be found.
				</AlertDescription>
			</Alert>
		);
	}

	const service = data[0];
	const ongoingEvent = getMostRecentOngoingEvent(service);

	const eventChartData = processServiceEvents(service);
	const timeChartData = processServiceEventTimes(service);

	const chartData = chartView === "events" ? eventChartData : timeChartData;

	return (
		<Suspense fallback={<LoadingServices />}>
			<div className="flex flex-col gap-4">
				<div className="bg-sidebar h-full border border-border rounded-md px-4 py-3">
					<div className="flex items-center gap-4">
						<Image
							src={`https://img.logo.dev/${service?.domain}?token=pk_bwZaLSQBRsi45tNJ3wHBXA`}
							alt={service?.name}
							className="rounded-full"
							height={44}
							width={44}
							priority
						/>

						<div className="flex flex-col items-start justify-between">
							<h1 className="text-2xl font-semibold text-foreground">
								{service?.name}
							</h1>
							<p className="text-sm text-muted-foreground leading-relaxed text-blue-500">
								{service?.domain}
							</p>
						</div>
					</div>
				</div>

				{ongoingEvent && (
					<div className="flex flex-col space-y-8 bg-sidebar border border-border rounded-md p-4">
						<div className="flex flex-col space-y-4">
							<div className="flex justify-between items-center">
								<h3 className="text-sm font-medium text-muted-foreground">
									Ongoing Disruption
								</h3>
								<span className=" flex items-center gap-1 text-xs tabular-nums font-semibold text-muted-foreground bg-background rounded-md px-2 py-1 border border-border">
									<Clock className="h-3 w-3" />
									{formatDistanceToNowStrict(
										parseISO(
											ongoingEvent.parsed_events?.[0]?.timestamp ||
												ongoingEvent.original_pub_date,
										),
									)}
								</span>
							</div>
							<h4 className="text-base font-semibold">{ongoingEvent.title}</h4>
							{ongoingEvent.summarized_description && (
								<p className="text-sm text-muted-foreground">
									{ongoingEvent.summarized_description}
								</p>
							)}
						</div>
						<Timeline event={ongoingEvent} />
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-sidebar h-full border border-border rounded-md p-4 space-y-2">
						<div className="flex items-center gap-2 font-semibold  text-muted-foreground">
							<span>🛠️</span>
							<span>WIP</span>
						</div>
						{/* <h3 className="text-sm font-medium text-muted-foreground mb-4">
							Recent events
						</h3> */}
						{/* <div className="h-56 overflow-y-auto space-y-2 scrollbar-hide">
							{service?.service_events.map((eventGroup, index) =>
								eventGroup?.events.map((event, eventIndex) => (
									<div
										key={`${index}-${eventIndex}`}
										className="bg-muted hover:bg-muted/50 transition-all rounded py-1 px-3 relative cursor-pointer truncate border"
									>
										<div
											className={`absolute left-0 top-0 bottom-0 w-1 rounded-tl-lg rounded-bl-lg top-[-1px] bottom-[-1px] left-[-1px] ${getSeverityColor(event?.severity ?? "")}`}
										/>
										<span className="text-sm font-semibold tracking-normal">
											{event.title}
										</span>
									</div>
								)),
							)}
						</div> */}
					</div>
					<div className="bg-sidebar h-full border border-border rounded-md p-3 space-y-2">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-medium text-muted-foreground">
								Disruptions
							</h3>
							<Select
								value={chartView}
								onValueChange={(value: ChartView) => setChartView(value)}
							>
								<SelectTrigger className="h-8 w-[140px] text-xs text-muted-foreground font-semibold ring-offset-0 ring-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:border-indigo-500 data-[state=open]:border-indigo-500 transition-colors">
									<SelectValue placeholder="Select view" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem className="text-xs" value="events">
										Disruption Type
									</SelectItem>
									<SelectItem className="text-xs" value="time">
										Total Time
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<ChartContainer config={chartConfig}>
							<ResponsiveContainer width="100%" height={300}>
								{chartView === "events" ? (
									<BarChart
										data={chartData}
										margin={{ left: -32 }}
										height={500}
									>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis dataKey="month" tickLine={false} axisLine={false} />
										<YAxis tickLine={false} axisLine={false} />
										<ChartTooltip content={<ChartTooltipContent />} />
										<ChartLegend content={<ChartLegendContent />} />
										<Bar
											dataKey="critical"
											stackId="a"
											fill={chartConfig.critical.color}
											radius={[0, 0, 0, 0]}
										/>
										<Bar
											dataKey="major"
											stackId="b"
											fill={chartConfig.major.color}
											radius={[0, 0, 0, 0]}
										/>
										<Bar
											dataKey="minor"
											stackId="c"
											fill={chartConfig.minor.color}
											radius={[0, 0, 0, 0]}
										/>
										<Bar
											dataKey="maintenance"
											stackId="d"
											fill={chartConfig.maintenance.color}
											radius={[0, 0, 0, 0]}
										/>
									</BarChart>
								) : (
									<BarChart
										data={timeChartData}
										margin={{ left: -20 }}
										height={500}
									>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis dataKey="month" tickLine={false} axisLine={false} />
										<YAxis
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => {
												const hours = Math.round(value / 60);
												if (hours >= 1000) {
													return `${(hours / 1000).toFixed(1)}K`;
												}
												return `${hours}h`;
											}}
										/>
										<ChartTooltip
											content={({ active, payload, label }) => {
												if (active && payload && payload.length) {
													const minutes = payload[0].value as number;
													const percentage =
														(minutes / timeChartData[0].totalMinutesInMonth) *
														100;
													const hours = Math.floor(minutes / 60);
													const remainingMinutes = minutes % 60;
													return (
														<div className="rounded-lg border bg-background p-2 shadow-md">
															<p className="text-sm font-medium">{`${hours}h ${remainingMinutes}m`}</p>
															<p className="text-xs text-muted-foreground">{`${percentage.toFixed(2)}% of ${label}`}</p>
														</div>
													);
												}
												return null;
											}}
										/>
										<Bar
											dataKey="totalMinutes"
											fill={chartConfig.major.color}
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								)}
							</ResponsiveContainer>
						</ChartContainer>
					</div>
				</div>
			</div>
		</Suspense>
	);
}
