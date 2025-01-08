import { ServiceDetails } from "@/components/service-details";
import { createClient } from "@/lib/supabase/server";
import { getServiceBySlug } from "@/queries/get-service-by-slug";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface ServicePageProps {
	params: Promise<{
		slug: string;
	}>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServicePage(props: ServicePageProps) {
	const params = await props.params;
	const queryClient = new QueryClient();
	const supabase = await createClient();

	await queryClient.prefetchQuery({
		queryKey: ["service", params.slug],
		queryFn: () => getServiceBySlug(supabase, params.slug),
		staleTime: 5 * 60 * 1000, // Increase stale time to 5 minutes
		gcTime: 10 * 60 * 1000, // Increase gc time to 10 minutes
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="container p-8">
				<ServiceDetails slug={params.slug} />
			</div>
		</HydrationBoundary>
	);
}

export async function generateMetadata(props: ServicePageProps) {
	const params = await props.params;
	const formattedSlug = params.slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
	return {
		title: `Is ${formattedSlug} down? See the latest info on the status of ${formattedSlug}`,
		description: `If ${formattedSlug} is having issues, monitor the latest status changes or outages here.`,
	};
}
