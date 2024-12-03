"use server";

import { createClient } from "@/lib/supabase/server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

export interface ActionResponse {
	success: boolean;
	data?: string;
	error?: string;
}

// Define the schema for the server action
const requestSchema = z.object({
	searchValue: z.string(),
});

// Create the server action
export const requestService = createSafeActionClient()
	.schema(requestSchema)
	.action(async ({ parsedInput: { searchValue } }): Promise<ActionResponse> => {
		const supabase = await createClient();

		try {
			const { error } = await supabase
				.from("service_requests")
				.insert({ name: searchValue });

			if (error) throw error;

			return { success: true, data: "Request submitted successfully" };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unexpected error",
			};
		}
	});
