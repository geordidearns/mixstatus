"use client";

import { useQuery } from "@tanstack/react-query";
import { Label, Pie, PieChart } from "recharts";
import { getServiceBySlug } from "@/queries/get-service-by-slug";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";
import { LoadingServices } from "./services-table/loading-services";
import Image from "next/image";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Service, ServiceEvent } from "@/types";
import { Timeline } from "./event-timeline";
// import { differenceInMonths } from "date-fns";

interface ServiceDetailsProps {
	slug: string;
}

function getSeverityColor(severity: string): string {
	switch (severity.toLowerCase()) {
		case "critical":
			return "bg-red-500";
		case "major":
			return "bg-orange-500";
		case "minor":
			return "bg-yellow-500";
		case "maintenance":
			return "bg-blue-500";
		default:
			return "bg-muted";
	}
}

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
	const severityCounts = {
		maintenance: 0,
		minor: 0,
		major: 0,
		critical: 0,
	};

	// const thirtyDaysAgo = new Date();
	// thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	// Count events by severity across all event groups
	service?.service_events.forEach((eventGroup) => {
		eventGroup?.events?.forEach((event) => {
			// const eventDate = new Date(event.original_pub_date);
			if (event?.severity) {
				const severity =
					event?.severity.toLowerCase() as keyof typeof severityCounts;
				severityCounts[severity] += 1;
			}
		});
	});

	// Transform into the required pie chart structure
	return [
		{
			name: "Maintenance",
			value: severityCounts.maintenance,
			fill: chartConfig.maintenance.color,
		},
		{
			name: "Minor",
			value: severityCounts.minor,
			fill: chartConfig.minor.color,
		},
		{
			name: "Major",
			value: severityCounts.major,
			fill: chartConfig.major.color,
		},
		{
			name: "Critical",
			value: severityCounts.critical,
			fill: chartConfig.critical.color,
		},
	];
}

// function getFirstEventDate(service: Service): string {
// 	let firstDate: Date | null = null;

// 	service?.service_events.forEach((eventGroup) => {
// 		eventGroup?.events?.forEach((event) => {
// 			const eventDate = new Date(event.created_at);
// 			if (!firstDate || eventDate < firstDate) {
// 				firstDate = eventDate;
// 			}
// 		});
// 	});

// 	if (!firstDate) return "No events";

// 	const monthsDiff = differenceInMonths(new Date(), firstDate);
// 	return monthsDiff === 0
// 		? "This month"
// 		: `Last ${monthsDiff} month${monthsDiff === 1 ? "" : "s"}`;
// }

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

	const chartData = processServiceEvents(service);
	const totalEvents: number = chartData.reduce(
		(sum, item) => sum + item.value,
		0,
	);

	return (
		<Suspense fallback={<LoadingServices />}>
			<div className="flex flex-col gap-4">
				<div className="bg-sidebar h-full border border-border rounded-full px-4 py-3">
					<div className="flex items-center gap-4">
						<Image
							src={`https://img.logo.dev/${service?.domain}?token=pk_bwZaLSQBRsi45tNJ3wHBXA`}
							alt={service?.name}
							className="rounded-full"
							height={48}
							width={48}
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
					<div className="bg-sidebar border border-border rounded-md p-4">
						<h3 className="text-sm font-medium text-muted-foreground mb-4">
							Ongoing Incident
						</h3>
						<h4 className="text-base font-semibold mb-2">
							{ongoingEvent.title}
						</h4>
						{ongoingEvent.summarized_description && (
							<p className="text-sm text-muted-foreground mb-6">
								{ongoingEvent.summarized_description}
							</p>
						)}
						<Timeline event={ongoingEvent} />
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-sidebar h-full border border-border rounded-md p-3 space-y-2">
						<h3 className="text-sm font-medium text-muted-foreground mb-4">
							Recent events
						</h3>
						<div className="h-56 overflow-y-auto space-y-2 scrollbar-hide">
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
						</div>
					</div>
					<div className="bg-sidebar h-full border border-border rounded-md p-3 space-y-2">
						<h3 className="text-sm font-medium text-muted-foreground mb-4">
							Disruptions
						</h3>
						<ChartContainer
							config={chartConfig}
							className="mx-auto aspect-square max-h-[200px]"
						>
							<PieChart>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Pie
									data={chartData}
									dataKey="value" // Changed from "visitors"
									nameKey="name" // Changed from "browser"
									innerRadius={60}
									outerRadius={80} // Added outerRadius
									paddingAngle={2} // Added padding between segments
									cx="50%" // Center horizontally
									cy="50%" // Center vertically
								>
									<Label
										content={({ viewBox }) => {
											if (viewBox && "cx" in viewBox && "cy" in viewBox) {
												return (
													<text
														x={viewBox.cx}
														y={viewBox.cy}
														textAnchor="middle"
														dominantBaseline="middle"
													>
														<tspan
															x={viewBox.cx}
															y={viewBox.cy}
															className="fill-foreground text-3xl font-bold font-mono"
														>
															{totalEvents}
														</tspan>
														<tspan
															x={viewBox.cx}
															y={(viewBox.cy || 0) + 24}
															className="font-mono fill-muted-foreground"
														>
															Total
														</tspan>
													</text>
												);
											}
										}}
									/>
								</Pie>
							</PieChart>
						</ChartContainer>
					</div>
				</div>
			</div>
		</Suspense>
	);
}
