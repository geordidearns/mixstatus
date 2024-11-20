"use server";

import { cookies } from "next/headers";

const ONBOARDING_COOKIE_NAME = "dismissed-onboarding";

export async function dismissOnboarding() {
	const cookieStore = await cookies();
	// Set cookie
	cookieStore.set(ONBOARDING_COOKIE_NAME, "true");
}
