import { Skeleton } from "@/components/ui/skeleton";

export function ServiceCardSkeleton() {
	return (
		<div className="flex flex-col border p-3 rounded-md bg-sidebar dark:bg-card text-card-foreground gap-4">
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<Skeleton className="h-4 w-4 rounded-full" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
			<div className="mx-0">
				<div className="flex w-full justify-between">
					{Array.from({ length: 14 }).map((_, i) => (
						<Skeleton key={i} className="h-2 w-2 rounded-full" />
					))}
				</div>
			</div>
		</div>
	);
}
