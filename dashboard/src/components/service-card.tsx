import Image from "next/image";
import EventGraph from "./event-graph";
import { ServiceEvents } from "@/types";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
	id: string;
	name: string;
	domain: string;
	events: ServiceEvents[];
	className?: string;
	action?: {
		component: React.ReactNode;
	};
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
	id,
	name,
	domain,
	events,
	className,
	action,
}) => {
	return (
		<div
			key={id}
			className={cn(
				"flex flex-col border p-3 rounded-md bg-sidebar dark:bg-card text-card-foreground gap-4 cursor-pointer",
				className
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
			<div className="mx-0">
				<EventGraph
					numberOfDays={14}
					serviceEvents={events || []}
					domain={domain}
				/>
			</div>
		</div>
	);
};
