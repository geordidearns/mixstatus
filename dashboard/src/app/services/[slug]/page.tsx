interface ServicePageProps {
	params: {
		slug: string;
	};
}

export default function ServicePage({ params }: ServicePageProps) {
	console.log("Service slug:", params.slug);

	return (
		<div className="container py-8">
			<h1 className="text-2xl font-bold">Service: {params.slug}</h1>
		</div>
	);
}
