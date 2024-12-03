import EventGraph from "../event-graph";

export function LoadingServices() {
	return (
		<div className="flex flex-col justify-center rounded mx-auto space-y-8 font-sans mt-8">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{Array.from({ length: 50 }).map((_, i) => (
					<div
						key={i}
						className={
							"flex flex-col border p-3 rounded-md bg-sidebar dark:bg-card text-card-foreground gap-4 cursor-pointer"
						}
					>
						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-2">
								<div className="h-5 w-5 rounded-full bg-border animate-pulse" />
								<span className="h-3 w-24 bg-border rounded animate-pulse" />
							</div>
						</div>
						<div className="mx-0 animate-pulse">
							<EventGraph number_of_days={14} service_events={[]} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
