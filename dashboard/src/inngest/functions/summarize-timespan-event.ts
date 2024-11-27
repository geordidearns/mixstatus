import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

export const summarizeTimespanEvent = inngest.createFunction(
	{
		id: "summarize-timespan-event",
	},
	{ event: "summarize-timespan-event" },
	async ({ event, step }) => {
		const eventId = event.data.event_id;

		const eventData = await step.run(`fetch-event`, async () => {
			const { data } = await supabase
				.from("service_events")
				.select("*")
				.eq("id", eventId)
				.single();

			return data;
		});

		const summarizedEvent = await step.run(`summarize-timespan`, async () => {
			try {
				const msg = await anthropic.beta.promptCaching.messages.create({
					model: "claude-3-5-sonnet-20241022",
					max_tokens: 8192,
					temperature: 0,
					system: [
						{
							text: `
                    Return only valid JSON as a response, and no extra information

                    Using the provided text - scan the text for a time range or specified number of minutes, and return the result. If a time range is given, calculate the exact number of minutes and return the value as an integer. If no value is found or calculated return null as the result

                    Example:

                    {
                    calculated_minutes: 13
                    }
                  `,
							type: "text",
							cache_control: { type: "ephemeral" },
						},
					],
					messages: [
						{
							role: "user",
							content: [{ type: "text", text: "-" }],
						},
						{
							role: "assistant",
							content: [
								{
									type: "text",
									cache_control: { type: "ephemeral" },
									text: JSON.stringify({
										calculated_minutes: 0,
									}),
								},
							],
						},
						{
							role: "user",
							content: [
								{
									type: "text",
									text: eventData?.raw_description,
								},
							],
						},
					],
				});

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				const result = JSON.parse(msg.content[0].text);

				console.log({
					result,
				});

				return result;
			} catch (error) {
				console.log(error);
				throw new Error("Failed to generate message from Anthropic API");
			}
		});

		await step.run(`update-timespan-event`, async () => {
			await supabase
				.from("service_events")
				.update({
					accumulated_time_minutes: summarizedEvent?.calculated_minutes,
				})
				.eq("id", eventId)
				.select();
		});

		return { success: true, message: "Successfully summarized event" };
	}
);
