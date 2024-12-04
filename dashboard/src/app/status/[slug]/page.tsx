interface ServicePageProps {
	params: {
		slug: string;
	};
	searchParams: { [key: string]: string | string[] | undefined };
}

export default function ServicePage({ params }: ServicePageProps) {
	return (
		<div className="container py-8">
			<h1 className="text-2xl font-bold">Service: {params.slug}</h1>
		</div>
	);
}

export async function generateMetadata({ params }: ServicePageProps) {
	return {
		title: `Is ${params.slug} down? See the latest status on ${params.slug} here`,
		description: `If ${params.slug} is having issues, monitor the latest status changes or outages here.`,
	};
}
