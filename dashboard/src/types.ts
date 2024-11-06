export interface Service {
	id: string;
	name: string;
	slug: string;
	domain: string;
	service_events: ServiceEvents[];
}

export interface ServiceEvents {
	date: string;
	events: ServiceEvent[];
}

export interface ServiceEvent {
	id: string;
	title: string;
	description: string;
	status: string;
	severity: "critical" | "major" | "minor" | "maintenance" | null;
	accumulated_time_minutes: number;
	original_pub_date: string;
	created_at: string;
	updated_at: string;
}
