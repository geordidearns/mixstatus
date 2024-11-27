import React from "react";
import Image from "next/image";
import { format, isBefore, isToday, isYesterday, startOfToday } from "date-fns";

interface Event {
	id: string;
	title: string;
	description: string;
	status: string;
	severity: "critical" | "major" | "minor" | "maintenance" | null;
	accumulated_time_minutes: number;
	original_pub_date: string;
	created_at: string;
}

const getFormattedDate = (date: Date) => {
	const dateObj = new Date(date);
	if (isToday(dateObj)) {
		return "Today";
	} else if (isYesterday(dateObj)) {
		return "Yesterday";
	} else {
		return format(dateObj, "MMMM do");
	}
};

const getEventIcon = (severity: string) => {
	switch (severity) {
		case "critical":
		case "major":
		case "minor":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4 text-white"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clipRule="evenodd"
					/>
				</svg>
			);
		case "maintenance":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4 text-white"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
					<path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
					<path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
				</svg>
			);
		default:
			return null;
	}
};

const getEventColor = (severity: Event["severity"]) => {
	switch (severity) {
		case "critical":
			return "bg-destructive";
		case "major":
			return "bg-orange-500 dark:bg-orange-600";
		case "minor":
			return "bg-yellow-500 dark:bg-yellow-600";
		case "maintenance":
			return "bg-blue-500 dark:bg-blue-600";
		default:
			return "bg-muted";
	}
};

const EventItem = ({ event }: { event: Event }) => {
	const today = startOfToday();
	const eventDate = new Date(event.original_pub_date);
	const duration = event.accumulated_time_minutes
		? `${event.accumulated_time_minutes} minutes`
		: null;
	const color = getEventColor(event.severity);

	return (
		<div
			className={`flex items-center justify-between hover:bg-muted dark:hover:bg-muted px-2 transition-colors rounded`}
		>
			<div className="flex items-center py-1">
				<div
					className={`w-6 h-6 mr-3 flex-shrink-0 rounded ${color} flex items-center justify-center`}
				>
					{getEventIcon(event.severity ?? "")}
				</div>
				<div className="flex flex-col gap-0.5 flex-1 min-w-0">
					<h3
						className="text-xs font-semibold text-foreground line-clamp-2"
						title={event.title}
					>
						{event.title}
					</h3>
					{event.accumulated_time_minutes ? (
						<p className="text-xs text-muted-foreground">
							{event.severity === "maintenance" ? "Completed in" : "Resolved in"}{" "}
							{duration}
						</p>
					) : isBefore(eventDate, today) ? (
						<p className="text-xs text-muted-foreground">
							Unable to determine resolution time
						</p>
					) : (
						<p className="text-xs text-muted-foreground">{`This ${
							event.severity === "maintenance"
								? "maintenance is scheduled for today"
								: "incident is ongoing"
						}`}</p>
					)}
				</div>
			</div>
		</div>
	);
};

const EventContent = ({
	events,
	domain,
}: {
	events: Event[];
	domain: string;
}) => {
	const eventDate = getFormattedDate(new Date(events[0]?.original_pub_date));

	return (
		<div className="flex flex-col">
			<div className="bg-background -mx-2 -my-2 rounded rounded-bl-none rounded-br-none border-b">
				<div className="flex justify-between p-2 py-2">
					<div className="flex gap-2 items-center">
						<Image
							src={`https://img.logo.dev/${domain}?token=pk_bwZaLSQBRsi45tNJ3wHBXA`}
							width={24}
							height={24}
							alt="Image of company logo"
							className="rounded"
						/>
						<div className="text-sm font-semibold text-foreground">{eventDate}</div>
					</div>
					<div className="flex justify-end">
						<a
							href="#"
							className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center transition-colors"
						>
							View all
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 ml-1"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
									clipRule="evenodd"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>
			<div className="mt-4 space-y-1">
				{events.map((event: Event) => (
					<EventItem key={event.id} event={event} />
				))}
			</div>
		</div>
	);
};

export default EventContent;
