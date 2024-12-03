// import { ServicesTable } from "@/components/services-table";
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
// import { Suspense } from "react";
import { ServicesWrapper } from "@/components/services-wrapper";
// import CohortAnalysis from "@/components/cohort";
import { showHeader } from "@/flags";
import MixstatusLogo from "@/components/mixstatus-logo";

export default async function Services() {
	const shouldShowHeader = await showHeader();
	const queryClient = new QueryClient();
	const supabase = await createClient();

	await queryClient.prefetchInfiniteQuery({
		queryKey: ["services-and-events"],
		queryFn: ({ pageParam }) => getServicesAndEvents(supabase, pageParam),
		initialPageParam: 0,
	});

	await queryClient.prefetchQuery({
		queryKey: ["ongoing-disruptions"],
		queryFn: () => getOngoingDisruptions(supabase),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<>
				{shouldShowHeader ? (
					<header className="sticky top-0 z-50 flex h-12 shrink-0 justify-center items-center gap-1 border-b px-2 bg-background">
						{/* <SidebarTrigger /> */}
						<div className="flex items-center gap-2">
							<MixstatusLogo size={24} />
							{/* <span className="font-mono font-bold text-lg">mixstatus</span> */}
						</div>
					</header>
				) : null}
				<div className="min-h-screen relative bg-background inset-0 h-full w-full  bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] [background-size:16px_16px]">
					<div className="w-full items-center justify-center p-8 relative z-10">
						{/* <OnboardingCard title="Hi there" description="How are you doing?" /> */}
						{/* <CohortAnalysis /> */}
						<ServicesWrapper />
					</div>
				</div>
			</>
		</HydrationBoundary>
	);
}
