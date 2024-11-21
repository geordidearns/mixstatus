import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { differenceInMinutes, parseISO, isValid, format } from "date-fns";
import { TZDate } from "@date-fns/tz";

function convertToUTCISOString(dateString: string) {
	// Try parsing the date string
	let date = parseISO(dateString);

	// If parsing fails, try creating a new Date object
	if (!isValid(date)) {
		date = new Date(dateString);
	}

	// If it's still not a valid date, return null or throw an error
	if (!isValid(date)) {
		return null; // or throw new Error('Invalid date string');
	}

	// Convert to UTC
	const utcDate = new TZDate(date, "UTC");

	// Format the date to ISO string in UTC
	return format(utcDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// async function fetchHtmlContent(url: string): Promise<string | null> {
// 	const apiKey = process.env.SCRAPINGANT_API_KEY;

// 	const apiUrl = `https://api.scrapingant.com/v2/extended?url=${url}&x-api-key=${apiKey}&proxy_country=GB`;

// 	try {
// 		const response = await fetch(apiUrl, {
// 			method: "GET",
// 			headers: {
// 				Accept: "application/json",
// 			},
// 		});

// 		if (!response.ok) {
// 			throw new Error(`HTTP error! status: ${response.status}`);
// 		}

// 		const data = await response.json();

// 		return data.text;
// 	} catch (error) {
// 		console.error("Error fetching HTML content:", error);
// 		return null;
// 	}
// }

// async function fetchMarkdownContent(url: string): Promise<string | null> {
// 	const apiKey = process.env.JINA_AI_API_KEY;

// 	try {
// 		const response = await fetch(`https://r.jina.ai/${url}`, {
// 			method: "GET",
// 			headers: {
// 				Authorization: `Bearer ${apiKey}`,
// 				Accept: "application/json",
// 				"X-Locale": "en-GB",
// 			},
// 		});

// 		if (!response.ok) {
// 			throw new Error(`HTTP error! status: ${response.status}`);
// 		}

// 		const res = await response.json();

// 		return res.data.content;
// 	} catch (error) {
// 		console.error("Error fetching HTML content:", error);
// 		return null;
// 	}
// }

export const summarizeEvent = inngest.createFunction(
	{
		id: "summarize-event",
	},
	{ event: "summarize-event" },
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

		console.log(eventData);

		// if (!eventData || !eventData?.title || eventData?.raw_description) {
		// 	throw new Error("Some attributes missing on the event data");
		// }

		// let descriptionText = null;

		// if (!eventData?.raw_description) {
		// 	descriptionText = await step.run(`fetch-description-text`, async () => {
		// 		try {
		// 			const guid: string = eventData?.guid;

		// 			return await fetchMarkdownContent(guid);
		// 		} catch (error) {
		// 			console.error(error);
		// 		}
		// 	});
		// }

		const summarizedEvent = await step.run(
			`summarize-and-parse-event`,
			async () => {
				try {
					const msg = await anthropic.beta.promptCaching.messages.create(
						{
							model: "claude-3-5-sonnet-20241022",
							max_tokens: 8192,
							temperature: 0,
							system: [
								{
									text: `
                    Your task is to parse markdown into events return only valid JSON format.

                    The following rules must be followed to ensure data accuracy in the result.

                    - use the 'original-publish-date' from the input as a guide for when the first event occurred

                    - use a standardized date-time format (ISO-8601) for all timestamps to ensure consistent parsing.

                    - do not change the input unless converting dates and times to a standardized date-time format (ISO-8601) OR removing links from the content

                    - any human formatted dates or times such as "Posted 1 day ago" should use a standardized date-time format (ISO-8601) instead

                    - the parsed_events property should include all individual events from the provided markdown

                    - the status property should be one of the following: ongoing, resolved or maintenance.

                    - events that have a status investigating, identified, monitoring or update should have the status ongoing.

                    - The severity property should be determined as accurately as possible based on the description, and given one of the following values: "critical", "major", "minor" or "maintenance"

                    Here is a further explanation of the severity property:

                    critical: a critical incident with very high impact. Examples of this can be a complete outage, confidentiality or privacy is breached or a customer data loss incident.

                    major: a major incident with high impact. Examples of this can be a partial outage, a significant performance degradation or a data integrity issue, a customer-facing service is unavailable for a large subset of customers. 

                    minor: a minor incident with low impact. Examples of this can be a minor performance degradation, a non-customer facing service is unavailable for a smaller subset of customers. 

                    maintenance: a planned maintenance event. Examples of this can be a deployment, a database migration or a network configuration change.

                    - find all affected components within the markdown and populate an array called affected_components with lowercase strings.

                    - when populating the affected_components array, include any specific services, service names, carrier names, or network providers mentioned in the event description in addition to the general components and regions affected.

                    Here are some examples:
                    service: "AT&T" would result in ["at&t", "sms", "carrier"]
                    feature: "Webhook notifications" delayed would result in ["webhook notifications", "webhooks", "notifications"]

                    - If the event is a scheduled maintenance event, use the description text to determine the total number of minutes of maintenance. If the description does not have this information only calculate between progress and completed or resolved updates and return maintenance_minutes property as a rounded integer.

										- additionally, if the scheduled maintenance event does not have a time range, set maintenance_minutes to null.

                    - If the event is not a scheduled maintenance event, set the maintenance_minutes property to null
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
												title: "Daily Recurring Tests Delayed affecting app.eu.snyk.io",
												description:
													"Daily Recurring Tests were delayed within the app.eu.snyk.io environment, causing delays for customers. The issue was identified, investigated, and resolved over several days.",
												severity: "major",
												recent_status: "resolved",
												maintenance_minutes: null,
												parsed_events: [
													{
														status: "ongoing",
														description:
															"Our Engineers have identified that daily Recurring Tests are delayed within our app.eu.snyk.io environment.",
														timestamp: "2024-09-03T08:43:00Z",
													},
													{
														status: "ongoing",
														description: "Our Engineer's investigations remain ongoing.",
														timestamp: "2024-09-03T10:19:00Z",
													},
													{
														status: "ongoing",
														description:
															"Our Engineers took the decision to cancel the delayed daily Recurring Tests scheduled for the 2nd of September, to prevent them from causing a knock-on delay to the tests scheduled for the 3rd of September.",
														timestamp: "2024-09-04T07:43:00Z",
													},
													{
														status: "ongoing",
														description:
															"Our engineers have confirmed that daily Recurring Tests scheduled to execute on the 4th of September have almost completed.",
														timestamp: "2024-09-05T12:50:00Z",
													},
													{
														status: "resolved",
														description:
															"All scheduled Recurring Tests are running as expected.",
														timestamp: "2024-09-05T15:08:00Z",
													},
												],
												affected_components: ["app.eu.snyk.io"],
											}),
										},
									],
								},
								{
									role: "user",
									content: [
										{
											type: "text",
											text: `
                          original-publish-date: ${eventData.original_pub_date}
                          title: ${eventData?.title}
                          description: ${eventData?.raw_description}
                        `,
										},
									],
								},
							],
						}

						// Add back when batch processing:

						// {
						// 	headers: {
						// 		"anthropic-beta": "prompt-caching-2024-07-31",
						// 	},
						// }

						// Example JSON result:

						// {
						// 		title: "Daily Recurring Tests Delayed affecting app.eu.snyk.io",
						// 		description:
						// 			"Daily Recurring Tests were delayed within the app.eu.snyk.io environment, causing delays for customers. The issue was identified, investigated, and resolved over several days.",
						// 		severity: "major",
						// 		recent_status: "resolved",
						// 		maintenance_minutes: null,
						// 		parsed_events: [
						// 			{
						// 				status: "ongoing",
						// 				description:
						// 					"Our Engineers have identified that daily Recurring Tests are delayed within our app.eu.snyk.io environment.",
						// 				timestamp: "2024-09-03T08:43:00Z",
						// 			},
						// 			{
						// 				status: "ongoing",
						// 				description: "Our Engineer's investigations remain ongoing.",
						// 				timestamp: "2024-09-03T10:19:00Z",
						// 			},
						// 			{
						// 				status: "ongoing",
						// 				description:
						// 					"Our Engineers took the decision to cancel the delayed daily Recurring Tests scheduled for the 2nd of September, to prevent them from causing a knock-on delay to the tests scheduled for the 3rd of September.",
						// 				timestamp: "2024-09-04T07:43:00Z",
						// 			},
						// 			{
						// 				status: "ongoing",
						// 				description:
						// 					"Our engineers have confirmed that daily Recurring Tests scheduled to execute on the 4th of September have almost completed.",
						// 				timestamp: "2024-09-05T12:50:00Z",
						// 			},
						// 			{
						// 				status: "resolved",
						// 				description:
						// 					"All scheduled Recurring Tests are running as expected.",
						// 				timestamp: "2024-09-05T15:08:00Z",
						// 			},
						// 		],
						// 		affected_components: ["app.eu.snyk.io"],
						// 	}
					);

					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					const result = JSON.parse(msg.content[0].text);

					console.log({ message: msg });

					const parsedEvents = result.parsed_events
						.map((event: { timestamp: string }) => ({
							...event,
							timestamp: convertToUTCISOString(event.timestamp) || event.timestamp,
						}))
						.sort(
							(a: { timestamp: string }, b: { timestamp: string }) =>
								new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
						);
					let previousTimestamp: Date | null = null;
					let totalAccumulatedMinutes = 0;

					const updatedEvents = parsedEvents.map((event: { timestamp: string }) => {
						const currentTimestamp = parseISO(event.timestamp);
						let minutesSinceLastUpdate = 0;

						if (previousTimestamp) {
							minutesSinceLastUpdate = differenceInMinutes(
								currentTimestamp,
								previousTimestamp
							);
							totalAccumulatedMinutes += minutesSinceLastUpdate;
						}

						previousTimestamp = currentTimestamp;

						return {
							...event,
							minutes_since_last_update: minutesSinceLastUpdate,
						};
					});

					// Overwrite parsed_events with updatedEvents
					result.parsed_events = updatedEvents;
					// Add total_accumulated_minutes property
					result.total_accumulated_minutes = totalAccumulatedMinutes;

					console.log({
						result,
					});

					return result;
				} catch (error) {
					console.log(error);
					throw new Error("Failed to generate message from Anthropic API");
				}
			}
		);

		await step.run(`upsert-event`, async () => {
			await supabase
				.from("service_events")
				.update({
					title: summarizedEvent.title,
					accumulated_time_minutes:
						summarizedEvent.severity === "maintenance"
							? summarizedEvent.maintenance_minutes
							: summarizedEvent.total_accumulated_minutes,
					severity: summarizedEvent.severity,
					status: summarizedEvent.recent_status,
					parsed_events: summarizedEvent.parsed_events,
					affected_components: summarizedEvent.affected_components,
					summarized_description: summarizedEvent.description,
					// raw_description: descriptionText,
				})
				.eq("id", eventId)
				.select();
		});

		return { success: true, message: "Successfully summarized event" };
	}
);
