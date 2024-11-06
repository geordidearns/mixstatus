import { ServicesTable } from "@/components/services-table";
import { createClient } from "@/lib/supabase/server";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getServicesAndEvents } from "@/queries/get-services";
import { SidebarTrigger } from "@/components/ui/sidebar";
// import CohortAnalysis from "@/components/cohort";

export default async function Services() {
	const queryClient = new QueryClient();
	const supabase = createClient();

	await queryClient.prefetchInfiniteQuery({
		queryKey: ["services-and-events", 1],
		queryFn: ({ pageParam }) => getServicesAndEvents(supabase, pageParam),
		initialPageParam: 0,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<>
				<header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-1 border-b px-2 bg-background">
					<SidebarTrigger />
				</header>
				<div className="min-h-screen relative bg-background inset-0 h-full w-full  bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] [background-size:16px_16px]">
					<div className="p-8 relative z-10">
						<ServicesTable />
						{/* <CohortAnalysis /> */}
					</div>
				</div>
			</>
		</HydrationBoundary>
	);
}
