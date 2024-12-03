import Image from "next/image";
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
	className?: string;
	action?: {
		component: React.ReactNode;
	};
}

export const OngoingIncidentCard: React.FC<OngoingIncidentCardProps> = ({
	id,
	name,
	domain,
	service_events,
	className,
	action,
}) => {
	const latestEvent = service_events[0].events[0];

	return (
		<div
			key={id}
			className={cn(
				"flex flex-col border p-3 rounded-md bg-sidebar dark:bg-card text-card-foreground gap-3 cursor-pointer",
				className,
			)}
		>
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<Image
						src={`https://img.logo.dev/${domain}?token=pk_bwZaLSQBRsi45tNJ3wHBXA`}
						width={16}
						height={16}
						alt={`${name} logo`}
						className="rounded-full"
					/>
					<span className="text-sm font-medium">{name}</span>
				</div>
				{action?.component}
			</div>

			<div className="flex items-center space-x-3">
				<div className="relative">
					<div
						className={cn(
							"w-2 h-2 rounded-full",
							getSeverityColor(latestEvent?.severity ?? ""),
						)}
					>
						<div className="relative">
							<div
								className={cn(
									"w-2 h-2 rounded-full",
									getSeverityColor(latestEvent?.severity ?? ""),
								)}
							>
								<div
									className={cn(
										"absolute inset-0 w-full h-full rounded-full",
										getSeverityColor(latestEvent?.severity ?? ""),
										"opacity-75 animate-ping",
									)}
								/>
							</div>
						</div>
					</div>
				</div>
				<HoverCard openDelay={0} closeDelay={0}>
					<HoverCardTrigger asChild>
						<span className="tracking-normal text-xs font-semibold text-foreground truncate cursor-pointer">
							{latestEvent?.title}
						</span>
					</HoverCardTrigger>
					<HoverCardContent className="w-96 p-0">
						<div className="flex flex-col gap-4">
							<div className="flex flex-col">
								<div className="flex items-center gap-2 p-2">
									<Image
										src={`https://img.logo.dev/${domain}?token=pk_bwZaLSQBRsi45tNJ3wHBXA`}
										width={16}
										height={16}
										alt={`${name} logo`}
										className="rounded-full"
									/>
									<span
										className="text-xs font-semibold text-foreground line-clamp-2"
										title={latestEvent?.title}
									>
										{latestEvent?.title}
									</span>
								</div>
								<div className="h-px bg-border w-full" />
								<p className="text-xs text-muted-foreground p-3">
									{latestEvent?.summarized_description}
								</p>
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			</div>
		</div>
	);
};