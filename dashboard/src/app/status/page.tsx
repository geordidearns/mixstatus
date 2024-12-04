import { createClient } from "@/lib/supabase/server";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import {
	getOngoingDisruptions,
	getServicesAndEvents,
} from "@/queries/get-services";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { OnboardingCard } from "@/components/onboarding-card";
import { ServicesWrapper } from "@/components/services-wrapper";
// import CohortAnalysis from "@/components/cohort";
import { showHeader } from "@/flags";
import { Header } from "@/components/header";

async function prefetchData() {
	const queryClient = new QueryClient(); // Use shared QueryClient instead of creating new one
	const supabase = await createClient();

	await Promise.all([
		queryClient.prefetchInfiniteQuery({
			queryKey: ["services-and-events"],
			queryFn: ({ pageParam }) => getServicesAndEvents(supabase, pageParam),
			initialPageParam: 0,
			staleTime: 5 * 60 * 1000, // Increase stale time to 5 minutes
			gcTime: 10 * 60 * 1000, // Increase gc time to 10 minutes
		}),
		queryClient.prefetchQuery({
			queryKey: ["ongoing-disruptions"],
			queryFn: () => getOngoingDisruptions(supabase),
			staleTime: 5 * 60 * 1000, // Increase stale time to 5 minutes
			gcTime: 10 * 60 * 1000, // Cache time
		}),
	]);

	return queryClient;
}

export default async function Services() {
	const [queryClient, shouldShowHeader] = await Promise.all([
		prefetchData(),
		showHeader(),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{shouldShowHeader && <Header />}
			<div className="min-h-screen relative bg-background inset-0 h-full w-full bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] [background-size:16px_16px]">
				<div className="w-full items-center justify-center p-4 md:p-8 relative z-10">
					<ServicesWrapper />
				</div>
			</div>
		</HydrationBoundary>
	);
}

// Add route segment config
export const runtime = "edge"; // Optional: Use edge runtime if possible
export const revalidate = 30; // Revalidate every 30 seconds
