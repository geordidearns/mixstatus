import { Service, ServiceEvent } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { parseISO } from "date-fns";
import { format } from "date-fns";

export async function getServiceBySlug(
	client: SupabaseClient,
	slug: string,
): Promise<Service[]> {
	try {
		const { data, error } = await client
			.from("services")
			.select(`
        id,
        name,
        slug,
        domain,
        service_events:service_events (
          id,
          title,
          summarized_description,
					parsed_events,
          status,
          severity,
          accumulated_time_minutes,
          original_pub_date,
          created_at,
          updated_at,
          affected_region,
          affected_components
        )
      `)
			.eq("slug", slug);

		if (!data) throw new Error("No service found");

		if (error) {
			console.error("Error fetching service:", error);
			throw error;
		}

		return data.map((service) => {
			const groupedEvents: { [date: string]: ServiceEvent[] } = {};

			service.service_events.forEach((event: ServiceEvent) => {
				const date = format(parseISO(event.original_pub_date), "yyyy-MM-dd");
				if (!groupedEvents[date]) {
					groupedEvents[date] = [];
				}
				groupedEvents[date].push(event);
			});

			return {
				...service,
				service_events: Object.entries(groupedEvents).map(([date, events]) => ({
					date,
					events,
				})),
			};
		});
	} catch (error) {
		console.error("Error fetching service:", error);
		throw error;
	}
}
