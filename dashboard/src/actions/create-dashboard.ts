"use server";

/*
	This file contains the actions for creating and updating dashboards.
	It created a anonymous user before creating a dashboard.
*/

import { createClient } from "@/lib/supabase/server";

export async function createDashboard(selectedServiceIds: string[]) {
	const supabase = await createClient();

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

	return dashboard.id;
}
