interface ServicePageProps {
	params: Promise<{
		slug: string;
	}>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServicePage(props: ServicePageProps) {
    const params = await props.params;
    return (
		<div className="container py-8">
			<h1 className="text-2xl font-bold">Service: {params.slug}</h1>
		</div>
	);
}

export async function generateMetadata(props: ServicePageProps) {
    const params = await props.params;
    return {
		title: `Is ${params.slug} down? See the latest status on ${params.slug} here`,
		description: `If ${params.slug} is having issues, monitor the latest status changes or outages here.`,
	};
}
