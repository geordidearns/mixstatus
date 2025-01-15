import { cn } from "@/lib/utils";
import { ServiceEvent } from "@/types";
import {
	format,
	formatDistanceToNowStrict,
	compareDesc,
	parseISO,
} from "date-fns";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

function getStatusColor(status: string, isLastEvent: boolean): string {
	if (status === "resolved") return "bg-green-500";
	if (status === "ongoing") {
		return isLastEvent ? "bg-red-500" : "bg-yellow-500";
	}
	return "bg-muted"; // fallback color
}

function sortEventsByDate(events: ServiceEvent["parsed_events"]) {
	return [...events].sort((a, b) =>
		compareDesc(parseISO(a.timestamp), parseISO(b.timestamp)),
	);
}

function getEventTitle(
	update: ServiceEvent["parsed_events"][0],
	isLastEvent: boolean,
): string {
	if (update.status === "resolved") return "Resolved";
	if (update.status === "ongoing" && isLastEvent) return "Reported";
	return "Update";
}

export function Timeline({ event }: { event: ServiceEvent }) {
	const sortedEvents = sortEventsByDate(event.parsed_events);

	return (
		<div className="relative space-y-8 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-12px)] before:w-px before:bg-border">
			{sortedEvents.map((update, index) => (
				<div key={update.timestamp} className="relative flex gap-4">
					<div className="absolute left-[3.5px] flex items-center justify-center">
						<div
							className={cn(
								getStatusColor(
									update.status ?? "",
									index === sortedEvents.length - 1,
								),
								"h-2 w-2 rounded-full",
							)}
						/>
					</div>

					<div className="flex-1 ml-6 space-y-3 -mt-1">
						<div className="flex justify-between items-center">
							<h4 className="flex text-sm font-semibold leading-none text-foreground">
								{getEventTitle(update, index === sortedEvents.length - 1)}
							</h4>
						</div>

						<p className="text-sm leading-relaxed text-muted-foreground">
							{update.description}
						</p>

						<div>
							<TooltipProvider>
								<Tooltip delayDuration={0}>
									<TooltipTrigger asChild>
										<div className="text-xs tabular-nums font-semibold text-muted-foreground">
											{formatDistanceToNowStrict(new Date(update.timestamp), {
												addSuffix: true,
											})}
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<span className="font-semibold text-xs">
											{format(
												new Date(update.timestamp),
												"EEE, MMM d, yyyy, hh:mm a (zzz)",
											)}
										</span>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
