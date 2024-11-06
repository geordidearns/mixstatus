import { createClient } from "@/lib/supabase/server";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getDashboardDetails } from "@/queries/get-services";
import { DashboardTable } from "@/components/dashboard-table";

export default async function Dashboard({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	const queryClient = new QueryClient();
	const supabase = createClient();

	await queryClient.prefetchQuery({
		queryKey: ["dashboard-services-and-events"],
		queryFn: () => getDashboardDetails(supabase, id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="min-h-screen relative bg-background inset-0 h-full w-full  bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] [background-size:16px_16px]">
				<div className="p-8 relative z-10">
					<DashboardTable dashboardId={id} />
				</div>
			</div>
		</HydrationBoundary>
	);
}
