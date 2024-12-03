"use server";

import { cookies } from "next/headers";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

export interface ActionResponse {
	success: boolean;
	data?: {
		theme: "light" | "dark";
	};
	error?: string;
}

const schema = z.object({
	theme: z.enum(["light", "dark"]),
});

export const setThemeAction = createSafeActionClient()
	.schema(schema)
	.action(async ({ parsedInput: { theme } }): Promise<ActionResponse> => {
		const cookieStore = await cookies();

		try {
			cookieStore.set("theme", theme);

			return { success: true, data: { theme } };
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (_) {
			return {
				success: false,
				error: "Failed to set theme",
			};
		}
	});
