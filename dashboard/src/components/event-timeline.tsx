import { cn } from "@/lib/utils";
import { ServiceEvent } from "@/types";
import { formatDistanceToNow, compareDesc, parseISO } from "date-fns";

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
								"h-2 w-2 rounded-full", // Updated classes
							)}
						/>
					</div>

					<div className="flex-1 ml-6 space-y-4">
						<div className="flex justify-between items-center mb-4 -mt-1">
							<h4 className="text-sm font-medium leading-none text-foreground">
								{getEventTitle(update, index === sortedEvents.length - 1)}
							</h4>
							<div className="flex flex-col gap-1">
								<span className="text-xs tabular-nums text-muted-foreground">
									{formatDistanceToNow(new Date(update.timestamp), {
										addSuffix: true,
									})}
								</span>
							</div>
						</div>

						<p className="text-sm leading-relaxed text-muted-foreground">
							{update.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
