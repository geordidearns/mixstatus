export interface Service {
	id: string;
	name: string;
	slug: string;
	domain: string;
	service_events: {
		date: string;
		events: ServiceEvent[];
	}[];
}

export interface ServiceEventGroup {
	date: string;
	events: ServiceEvent[];
}

export interface ServiceEvent {
	id: string;
	title: string;
	summarized_description: string;
	parsed_events: ParsedEvent[];
	status: ServiceEventStatus;
	severity: ServiceEventSeverity;
	accumulated_time_minutes: number;
	original_pub_date: string;
	affected_region: string;
	affected_components: string[];
	created_at: string;
	updated_at: string;
}

export interface ParsedEvent {
	status: ServiceEventStatus;
	timestamp: string;
	description: string;
	minutes_since_last_update: number;
}

export type ServiceEventStatus = "resolved" | "ongoing" | "maintenance";

export type ServiceEventSeverity =
	| "critical"
	| "major"
	| "minor"
	| "maintenance"
	| null;
