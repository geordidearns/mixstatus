import { getRange } from "@/lib/utils";
import { Service, ServiceEvent } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { endOfDay, format, parseISO, subDays } from "date-fns";

/* group the events by date 2024-10-19 etc */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupServiceEvents(services: any) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const groupedData: Service[] = services.map((service: any) => {
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

	return groupedData;
}

export async function getServicesAndEvents(
	client: SupabaseClient,
	page: number,
	nameFilter?: string
) {
	try {
		const pageSize = 50;
		const range = getRange(page, pageSize);
		const now = new Date();
		const twoWeeksAgo = endOfDay(subDays(now, 14));
		const endOfToday = endOfDay(now);

		let query = client
			.from("services")
			.select(
				`
        id,
        name,
        slug,
        domain,
        service_events:service_events (
          id,
          title,
          summarized_description,
          status,
          severity,
          accumulated_time_minutes,
          original_pub_date,
          created_at,
          updated_at
        )
      `
			)
			.order("name");

		if (nameFilter) {
			query = query.ilike("name", `%${nameFilter}%`);
		}

		const { data, error } = await query
			.gte(
				"service_events.original_pub_date",
				format(twoWeeksAgo, "yyyy-MM-dd'T'HH:mm:ssXXX")
			)
			.lte(
				"service_events.original_pub_date",
				format(endOfToday, "yyyy-MM-dd'T'HH:mm:ssXXX")
			)
			.range(range[0], range[1]);

		if (error) {
			console.error("Error fetching data:", error);
			throw error;
		}

		return data;

		if (error) {
			console.error("Error fetching data:", error);
			throw error;
		}

		if (error) throw error;

		return data;
	} catch (error) {
		console.error("Error fetching services:", error);
		throw error;
	}
}

export async function getDashboardDetails(
	client: SupabaseClient,
	dashboardId: string
) {
	try {
		const now = new Date();
		const sevenDaysAgo = endOfDay(subDays(now, 7));
		const endOfToday = endOfDay(now);

		const { data: dashboard, error: dashboardError } = await client
			.from("dashboards")
			.select(
				`
				id,
				title,
				service_ids,
				dashboard_members (
					id,
					user_id
				)
			`
			)
			.eq("id", dashboardId)
			.single();

		if (dashboardError) throw dashboardError;

		const serviceIds =
			typeof dashboard.service_ids === "string"
				? JSON.parse(dashboard.service_ids)
				: dashboard.service_ids;

		// Then, get the services using the service_ids array
		const { data: services, error: servicesError } = await client
			.from("services")
			.select(
				`
				id,
				name,
				slug,
				domain,
				service_events (
					id,
					title,
					summarized_description,
					status,
					severity,
					accumulated_time_minutes,
					original_pub_date,
					created_at,
					updated_at
				)
			`
			)
			.in("id", serviceIds)
			.gte(
				"service_events.original_pub_date",
				format(sevenDaysAgo, "yyyy-MM-dd'T'HH:mm:ssXXX")
			)
			.lte(
				"service_events.original_pub_date",
				format(endOfToday, "yyyy-MM-dd'T'HH:mm:ssXXX")
			);

		if (servicesError) throw servicesError;

		return { ...dashboard, services };
	} catch (error) {
		console.error("Error fetching dashboard details:", error);
		throw error;
	}
}
