"use server";

import { createClient } from "@/lib/supabase/server";

export async function createDashboard(selectedServiceIds: string[]) {
	const supabase = createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.signInAnonymously();

	if (error) {
		console.error("Error creating anonymous user:", error);
		throw new Error("Failed to create dashboard");
	}

	if (!user) {
		throw new Error("Failed to create user");
	}

	const { data: dashboard, error: dashboardError } = await supabase
		.from("dashboards")
		.insert({ user_id: user.id, service_ids: selectedServiceIds })
		.select()
		.single();

	const { error: dashboardMemberError } = await supabase
		.from("dashboard_members")
		.insert({ user_id: user.id, dashboard_id: dashboard?.id });

	if (dashboardError || dashboardMemberError) {
		console.error("Error creating dashboard:", dashboardError);
		throw new Error("Failed to create dashboard");
	}

	// Return id of created dashboard
	return dashboard.id;
}

export async function updateDashboard(
	dashboardId: string,
	selectedServiceIds: string[]
) {
	const supabase = createClient();

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
