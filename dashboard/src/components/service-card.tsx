import Image from "next/image";
import EventGraph from "./event-graph";
import { ServiceEventGroup } from "@/types";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
	id: string;
	name: string;
	domain: string;
	service_events: ServiceEventGroup[];
	className?: string;
	action?: {
		component: React.ReactNode;
	};
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
	id,
	name,
	domain,
	service_events,
	className,
	action,
}) => {
	return (
		<div
			key={id}
			className={cn(
				"flex flex-col border p-3 rounded-md bg-sidebar dark:bg-card text-card-foreground gap-4",
				className,
			)}
		>
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<div className="relative w-4 h-4 flex-shrink-0">
						<Image
							src={`https://img.logo.dev/${domain}?token=pk_bwZaLSQBRsi45tNJ3wHBXA`}
							fill
							alt={`${domain} logo image`}
							className="rounded-full object-cover"
						/>
					</div>
					<span className="text-sm font-medium">{name}</span>
				</div>
				{action?.component}
			</div>
			<div className="mx-0">
				<EventGraph
					number_of_days={14}
					service_events={service_events}
					domain={domain}
				/>
			</div>
		</div>
	);
};
