import React from "react";
import { subDays, isSameDay, startOfDay, parseISO } from "date-fns";
import { TZDate } from "@date-fns/tz";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import EventContent from "../event-hover-content";
import { ServiceEvent, ServiceEventGroup } from "@/types";
// import EventContent from "../event-card/event-hover-content";

interface ServiceEventGraph {
	number_of_days: number;
	service_events: ServiceEventGroup[];
	domain?: string;
}

const getColor = (events: ServiceEvent[]): string => {
	if (events.length === 0) return "bg-border";
	if (events.some((e) => e.severity === "critical")) return "bg-red-500";
	if (events.some((e) => e.severity === "major")) return "bg-orange-500";
	if (events.some((e) => e.severity === "minor")) return "bg-yellow-500";
	if (events.some((e) => e.severity === "maintenance")) return "bg-blue-500";

	return "bg-gray-300"; /* If none of the above conditions are met */
};

const isOngoing = (events: ServiceEvent[]): boolean => {
	if (events.length === 0) return false;
	if (
		events.some((e) => e.status !== "resolved" && e.severity !== "maintenance")
	)
		return true;

	return false; /* If none of the above conditions are met */
};

const EventGraph: React.FC<ServiceEventGraph> = ({
	number_of_days,
	service_events,
	domain,
}) => {
	const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const today = startOfDay(new TZDate(new Date(), userTimeZone));
	const days = Array.from({ length: number_of_days }, (_, i) =>
		subDays(today, number_of_days - 1 - i),
	);

	const getEvents = (date: Date): ServiceEvent[] => {
		const contribution = service_events.find((item: ServiceEventGroup) =>
			isSameDay(new TZDate(parseISO(item.date), userTimeZone), date),
		);
		return contribution ? contribution.events : [];
	};

	return (
		<div className="flex w-full justify-between">
			{days.map((day, index) => {
				const events = getEvents(day);
				const color = getColor(events);

				return (
					<HoverCard key={index} openDelay={300}>
						<HoverCardTrigger className="cursor-pointer">
							<div className="relative w-2 h-2">
								<div className={`absolute inset-0 rounded-full ${color}`}></div>
								<div
									className={`absolute inset-0 rounded-full ${color} ${
										isOngoing(events) && "animate-ping"
									} opacity-75`}
								></div>
							</div>
						</HoverCardTrigger>
						{events.length > 0 && (
							<HoverCardContent side="top" className="w-[400px] p-2">
								<EventContent events={events} domain={domain ?? ""} />
							</HoverCardContent>
						)}
					</HoverCard>
				);
			})}
		</div>
	);
};

export default EventGraph;
