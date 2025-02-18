import { getRange } from "@/lib/utils";
import { Service, ServiceEvent } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { endOfDay, format, parseISO, subDays } from "date-fns";

export async function getServicesAndEvents(
	client: SupabaseClient,
	page: number,
	nameFilter?: string,
): Promise<Service[]> {
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
      `,
			)
			.order("name");

		if (nameFilter) {
			query = query.ilike("name", `%${nameFilter}%`);
		}

		const { data, error } = await query
			.gte(
				"service_events.original_pub_date",
				format(twoWeeksAgo, "yyyy-MM-dd'T'HH:mm:ssXXX"),
			)
			.lte(
				"service_events.original_pub_date",
				format(endOfToday, "yyyy-MM-dd'T'HH:mm:ssXXX"),
			)
			.range(range[0], range[1]);

		if (error) {
			console.error("Error fetching data:", error);
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
		console.error("Error fetching services:", error);
		throw error;
	}
}

export async function getOngoingDisruptions(
	client: SupabaseClient,
	nameFilter?: string,
): Promise<Service[]> {
	const now = new Date();
	const sevenDaysAgo = endOfDay(subDays(now, 7));
	const endOfToday = endOfDay(now);

	try {
		let query = client
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
		`,
			)
			.eq("service_events.status", "ongoing")
			.gte(
				"service_events.original_pub_date",
				format(sevenDaysAgo, "yyyy-MM-dd'T'HH:mm:ssXXX"),
			)
			.lte(
				"service_events.original_pub_date",
				format(endOfToday, "yyyy-MM-dd'T'HH:mm:ssXXX"),
			)
			.order("name");

		if (nameFilter) {
			query = query.ilike("name", `%${nameFilter}%`);
		}

		const { data, error } = await query
			.gte(
				"service_events.original_pub_date",
				format(sevenDaysAgo, "yyyy-MM-dd'T'HH:mm:ssXXX"),
			)
			.lte(
				"service_events.original_pub_date",
				format(endOfToday, "yyyy-MM-dd'T'HH:mm:ssXXX"),
			);

		if (error) {
			console.error("Error fetching ongoing disruptions:", error);
			throw error;
		}

		// Filter out services with no service_events and group by date
		const filteredData = data
			?.filter(
				(service) =>
					service.service_events && service.service_events.length > 0,
			)
			.map((service) => {
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
					service_events: Object.entries(groupedEvents).map(
						([date, events]) => ({
							date,
							events,
						}),
					),
				};
			});

		return filteredData;
	} catch (error) {
		console.error("Error fetching ongoing disruptions:", error);
		throw error;
	}
}

export async function getDashboardDetails(
	client: SupabaseClient,
	dashboardId: string,
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
			`,
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
			`,
			)
			.in("id", serviceIds)
			.gte(
				"service_events.original_pub_date",
				format(sevenDaysAgo, "yyyy-MM-dd'T'HH:mm:ssXXX"),
			)
			.lte(
				"service_events.original_pub_date",
				format(endOfToday, "yyyy-MM-dd'T'HH:mm:ssXXX"),
			);

		if (servicesError) throw servicesError;

		return services.map((service) => {
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
		console.error("Error fetching dashboard details:", error);
		throw error;
	}
}
