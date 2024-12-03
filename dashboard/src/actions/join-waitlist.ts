/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

export interface ActionResponse {
	success: boolean;
}

const schema = z.object({
	email: z.string().email(),
});

export const joinWaitlist = createSafeActionClient()
	.schema(schema)
	.action(async ({ parsedInput: { email } }): Promise<ActionResponse> => {
		try {
			const response = await fetch(
				"https://app.loops.so/api/v1/contacts/create",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email,
						source: "website_waitlist",
						subscribed: true,
					}),
				},
			);

			if (!response.ok) throw new Error("Failed to join waitlist");

			return {
				success: true,
			};
		} catch (_) {
			return {
				success: false,
			};
		}
	});
