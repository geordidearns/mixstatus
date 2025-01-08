import Image from "next/image";
import Link from "next/link";
import { ServiceEventGroup } from "@/types";
import { cn } from "@/lib/utils";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

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

interface OngoingIncidentCardProps {
	id: string;
	name: string;
	domain: string;
	service_events: ServiceEventGroup[];
	slug: string;
	className?: string;
	action?: {
		component: React.ReactNode;
	};
}

export const OngoingIncidentCard: React.FC<OngoingIncidentCardProps> = ({
	id,
	name,
	domain,
	slug,
	service_events,
	className,
	action,
}) => {
	const latestEvent = service_events
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
		?.events.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		)[0];

	const color = getSeverityColor(latestEvent?.severity ?? "");

	return (
		<HoverCard openDelay={0} closeDelay={0}>
			<Link href={`/status/${slug}`} className="block" prefetch>
				<div
					key={id}
					className={cn(
						`flex flex-col p-3 rounded-md bg-sidebar dark:bg-card text-card-foreground gap-2 cursor-pointer border`,
						className,
					)}
					style={{ position: "relative" }} // Add relative positioning
				>
					{/* Add a pseudo-element for the thicker left border */}
					<div
						className={`absolute left-0 top-0 bottom-0 w-1 rounded-tl-lg rounded-bl-lg top-[-1px] bottom-[-1px] left-[-1px] ${color}`}
					/>

					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-2">
							<Image
								src={`https://img.logo.dev/${domain}?token=pk_bwZaLSQBRsi45tNJ3wHBXA`}
								width={16}
								height={16}
								alt={`${domain} logo image`}
								className="rounded-full w-auto h-auto"
								priority={true}
							/>
							<span className="text-sm font-semibold">{name}</span>
						</div>
						{action?.component}
					</div>

					<HoverCardTrigger asChild>
						<div className="flex items-center space-x-3">
							<div className="relative">
								<div className={cn("w-2 h-2 rounded-full", color)}>
									<div className="relative">
										<div className={cn("w-2 h-2 rounded-full", color)}>
											<div
												className={cn(
													"absolute inset-0 w-full h-full rounded-full",
													color,
													"opacity-75 animate-ping",
												)}
											/>
										</div>
									</div>
								</div>
							</div>
							<span className="tracking-normal text-xs font-semibold text-foreground truncate">
								{latestEvent?.title}
							</span>
						</div>
					</HoverCardTrigger>
				</div>
			</Link>
			<HoverCardContent className="w-96 p-0">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col">
						<div className="flex items-center gap-2 p-2">
							<Image
								src={`https://img.logo.dev/${domain}?token=pk_bwZaLSQBRsi45tNJ3wHBXA`}
								width={16}
								height={16}
								alt={`${domain} logo image`}
								className="rounded-full w-auto h-auto"
							/>
							<span
								className="text-xs font-semibold text-foreground line-clamp-2"
								title={latestEvent?.title}
							>
								{latestEvent?.title}
							</span>
						</div>
						<div className="h-px bg-border w-full" />
						<p className="text-xs text-muted-foreground p-3 leading-relaxed">
							{latestEvent?.summarized_description}
						</p>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};
