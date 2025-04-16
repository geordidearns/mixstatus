"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateDashboard(
	dashboardId: string,
	selectedServiceIds: string[],
) {
	const supabase = await createClient();

	const { data: dashboard, error: dashboardError } = await supabase
		.from("dashboards")
		.update({ service_ids: selectedServiceIds })
		.eq("id", dashboardId)
		.select()
		.single();

	if (dashboardError) {
		console.error("Error updating dashboard:", dashboardError);
		throw new Error("Failed to update dashboard");
	}

	return dashboard.id;
}
