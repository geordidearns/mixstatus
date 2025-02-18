import { inngest } from "../client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
// import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { differenceInMinutes, parseISO, isValid, format } from "date-fns";
import { TZDate } from "@date-fns/tz";

interface ParsedEvent {
	status: string;
	description: string;
	timestamp: string;
	minutes_since_last_update?: number;
}

interface SummarizedEvent {
	title: string;
	description: string;
	severity: "critical" | "major" | "minor" | "maintenance";
	recent_status: "ongoing" | "resolved" | "maintenance";
	maintenance_minutes: number | null;
	parsed_events: ParsedEvent[];
	affected_components: string[];
	affected_region:
		| "north-america"
		| "europe"
		| "asia"
		| "australasia"
		| "south-america"
		| "global";
	total_accumulated_minutes?: number;
}

function convertToUTCISOString(dateString: string) {
	let date = parseISO(dateString);

	// If parsing fails, try creating a new Date object
	if (!isValid(date)) {
		date = new Date(dateString);
	}

	if (!isValid(date)) {
		throw new Error("Invalid date string");
	}

	const utcDate = new TZDate(date, "UTC");

	// Format the date to ISO string in UTC
	return format(utcDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_ANON_KEY!,
);

// const anthropic = new Anthropic({
// 	apiKey: process.env.ANTHROPIC_API_KEY ?? "",
// });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const schema = {
	type: SchemaType.OBJECT,
	properties: {
		title: {
			type: SchemaType.STRING,
			description: "Title of the service event",
			nullable: false,
		},
		description: {
			type: SchemaType.STRING,
			description: "Summary description of the entire event",
			nullable: false,
		},
		severity: {
			type: SchemaType.STRING,
			description: "Severity level of the event",
			enum: ["critical", "major", "minor", "maintenance"],
			nullable: false,
		},
		recent_status: {
			type: SchemaType.STRING,
			description: "Current status of the event",
			enum: ["ongoing", "resolved", "maintenance"],
			nullable: false,
		},
		maintenance_minutes: {
			type: SchemaType.NUMBER,
			description: "Duration of maintenance in minutes, if applicable",
			nullable: true,
		},
		parsed_events: {
			type: SchemaType.ARRAY,
			description: "List of individual status updates",
			items: {
				type: SchemaType.OBJECT,
				properties: {
					status: {
						type: SchemaType.STRING,
						description: "Status of the individual update",
						enum: ["ongoing", "resolved", "maintenance"],
						nullable: false,
					},
					description: {
						type: SchemaType.STRING,
						description: "Description of the status update",
						nullable: false,
					},
					timestamp: {
						type: SchemaType.STRING,
						description: "ISO 8601 timestamp of the update",
						nullable: false,
					},
				},
				required: ["status", "description", "timestamp"],
			},
		},
		affected_components: {
			type: SchemaType.ARRAY,
			description: "List of affected system components",
			items: {
				type: SchemaType.STRING,
				description: "Name of affected component",
			},
		},
		affected_region: {
			type: SchemaType.STRING,
			description: "Geographic region affected by the event",
			enum: [
				"north-america",
				"europe",
				"asia",
				"australasia",
				"south-america",
				"global",
			],
			nullable: false,
		},
	},
	required: [
		"title",
		"description",
		"severity",
		"recent_status",
		"parsed_events",
		"affected_components",
		"affected_region",
	],
};
const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash",
	generationConfig: {
		responseMimeType: "application/json",
		responseSchema: schema,
	},
});

function processEvents(events: ParsedEvent[]): {
	updatedEvents: ParsedEvent[];
	totalAccumulatedMinutes: number;
} {
	const parsedEvents = events
		.map((event) => ({
			...event,
			timestamp: convertToUTCISOString(event.timestamp) || event.timestamp,
		}))
		.sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);

	let previousTimestamp: Date | null = null;
	let totalAccumulatedMinutes = 0;

	const updatedEvents = parsedEvents.map((event) => {
		const currentTimestamp = parseISO(event.timestamp);
		let minutesSinceLastUpdate = 0;

		if (previousTimestamp) {
			minutesSinceLastUpdate = differenceInMinutes(
				currentTimestamp,
				previousTimestamp,
			);
			totalAccumulatedMinutes += minutesSinceLastUpdate;
		}

		previousTimestamp = currentTimestamp;
		return { ...event, minutes_since_last_update: minutesSinceLastUpdate };
	});

	return { updatedEvents, totalAccumulatedMinutes };
}

async function updateServiceEvent(
	supabase: SupabaseClient,
	eventId: string,
	summarizedEvent: SummarizedEvent,
) {
	return supabase
		.from("service_events")
		.update({
			title: summarizedEvent.title,
			accumulated_time_minutes:
				summarizedEvent.recent_status === "ongoing"
					? null
					: summarizedEvent.severity === "maintenance"
						? summarizedEvent.maintenance_minutes
						: summarizedEvent.total_accumulated_minutes,
			severity: summarizedEvent.severity,
			status: summarizedEvent.recent_status,
			parsed_events: summarizedEvent.parsed_events,
			affected_components: summarizedEvent.affected_components,
			affected_region: summarizedEvent.affected_region,
			summarized_description: summarizedEvent.description,
			updated_at: new Date().toISOString(),
		})
		.eq("id", eventId)
		.select();
}

async function publishStatusUpdate(eventId: string, status: string) {
	const ablyApiKey = process.env.ABLY_SUBSCRIBE_AND_PUBLISH_API_KEY;

	if (!ablyApiKey) {
		throw new Error("ABLY_API_KEY is required");
	}

	const response = await fetch(
		`https://rest.ably.io/channels/services-updates/messages`,
		{
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(ablyApiKey).toString("base64")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: "status.update",
				data: { event_id: eventId, status },
			}),
		},
	);

	if (!response.ok) {
		throw new Error("Failed to publish status update to Ably");
	}
}

export const summarizeEvent = inngest.createFunction(
	{
		id: "summarize-event",
	},
	{ event: "summarize-event" },
	async ({ event, step }) => {
		const eventId = event.data.event_id;

		if (!eventId) {
			throw new Error("No event ID, unable to summarize event");
		}

		const eventData = await step.run(`fetch-event`, async () => {
			const { data } = await supabase
				.from("service_events")
				.select("*")
				.eq("id", eventId)
				.single();

			return data;
		});

		const GEMINI_SYSTEM_PROMPT = `
			Your task is to parse html, text or markdown into events return only valid JSON format.

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

			- Determine the affected_region based on the location of the affected components. If the affected components are in multiple regions, use the global region. The regions are: north-america, europe, asia, australasia, south-america, global.

			- If the event is a scheduled maintenance event, use the description text to determine the total number of minutes of maintenance. If the description does not have this information only calculate between progress and completed or resolved updates and return maintenance_minutes property as a rounded integer.

			- additionally, if the scheduled maintenance event does not have a time range, set maintenance_minutes to null.

			- If the event is not a scheduled maintenance event, set the maintenance_minutes property to null

			Input:
			original-publish-date: ${eventData.original_pub_date}
			title: ${eventData?.title}
			description: ${eventData?.raw_description}
		`;

		// const ANTHROPIC_SYSTEM_PROMPT = `
		// 	Your task is to parse html, text or markdown into events return only valid JSON format.

		// 	The following rules must be followed to ensure data accuracy in the result.

		// 	- use the 'original-publish-date' from the input as a guide for when the first event occurred

		// 	- use a standardized date-time format (ISO-8601) for all timestamps to ensure consistent parsing.

		// 	- do not change the input unless converting dates and times to a standardized date-time format (ISO-8601) OR removing links from the content

		// 	- any human formatted dates or times such as "Posted 1 day ago" should use a standardized date-time format (ISO-8601) instead

		// 	- the parsed_events property should include all individual events from the provided markdown

		// 	- the status property should be one of the following: ongoing, resolved or maintenance.

		// 	- events that have a status investigating, identified, monitoring or update should have the status ongoing.

		// 	- The severity property should be determined as accurately as possible based on the description, and given one of the following values: "critical", "major", "minor" or "maintenance"

		// 	Here is a further explanation of the severity property:

		// 	critical: a critical incident with very high impact. Examples of this can be a complete outage, confidentiality or privacy is breached or a customer data loss incident.

		// 	major: a major incident with high impact. Examples of this can be a partial outage, a significant performance degradation or a data integrity issue, a customer-facing service is unavailable for a large subset of customers.

		// 	minor: a minor incident with low impact. Examples of this can be a minor performance degradation, a non-customer facing service is unavailable for a smaller subset of customers.

		// 	maintenance: a planned maintenance event. Examples of this can be a deployment, a database migration or a network configuration change.

		// 	- find all affected components within the markdown and populate an array called affected_components with lowercase strings.

		// 	- when populating the affected_components array, include any specific services, service names, carrier names, or network providers mentioned in the event description in addition to the general components and regions affected.

		// 	Here are some examples:
		// 	service: "AT&T" would result in ["at&t", "sms", "carrier"]
		// 	feature: "Webhook notifications" delayed would result in ["webhook notifications", "webhooks", "notifications"]

		// 	- Determine the affected_region based on the location of the affected components. If the affected components are in multiple regions, use the global region. The regions are: north-america, europe, asia, australasia, south-america, global.

		// 	- If the event is a scheduled maintenance event, use the description text to determine the total number of minutes of maintenance. If the description does not have this information only calculate between progress and completed or resolved updates and return maintenance_minutes property as a rounded integer.

		// 	- additionally, if the scheduled maintenance event does not have a time range, set maintenance_minutes to null.

		// 	- If the event is not a scheduled maintenance event, set the maintenance_minutes property to null
		// `;

		const summarizedEvent = await step.run(
			"summarize-and-parse-event",
			async () => {
				// const msg = await anthropic.beta.promptCaching.messages.create({
				// 	model: "claude-3-5-sonnet-20241022",
				// 	max_tokens: 8192,
				// 	temperature: 0,
				// 	system: [
				// 		{
				// 			text: ANTHROPIC_SYSTEM_PROMPT,
				// 			type: "text",
				// 			cache_control: { type: "ephemeral" },
				// 		},
				// 	],
				// 	messages: [
				// 		{
				// 			role: "user",
				// 			content: [{ type: "text", text: "-" }],
				// 		},
				// 		{
				// 			role: "assistant",
				// 			content: [
				// 				{
				// 					type: "text",
				// 					cache_control: { type: "ephemeral" },
				// 					text: JSON.stringify({
				// 						title:
				// 							"Daily Recurring Tests Delayed affecting app.eu.snyk.io",
				// 						description:
				// 							"Daily Recurring Tests were delayed within the app.eu.snyk.io environment, causing delays for customers. The issue was identified, investigated, and resolved over several days.",
				// 						severity: "major",
				// 						recent_status: "resolved",
				// 						maintenance_minutes: null,
				// 						parsed_events: [
				// 							{
				// 								status: "ongoing",
				// 								description:
				// 									"Our Engineers have identified that daily Recurring Tests are delayed within our app.eu.snyk.io environment.",
				// 								timestamp: "2024-09-03T08:43:00Z",
				// 							},
				// 							{
				// 								status: "ongoing",
				// 								description:
				// 									"Our Engineer's investigations remain ongoing.",
				// 								timestamp: "2024-09-03T10:19:00Z",
				// 							},
				// 							{
				// 								status: "ongoing",
				// 								description:
				// 									"Our Engineers took the decision to cancel the delayed daily Recurring Tests scheduled for the 2nd of September, to prevent them from causing a knock-on delay to the tests scheduled for the 3rd of September.",
				// 								timestamp: "2024-09-04T07:43:00Z",
				// 							},
				// 							{
				// 								status: "ongoing",
				// 								description:
				// 									"Our engineers have confirmed that daily Recurring Tests scheduled to execute on the 4th of September have almost completed.",
				// 								timestamp: "2024-09-05T12:50:00Z",
				// 							},
				// 							{
				// 								status: "resolved",
				// 								description:
				// 									"All scheduled Recurring Tests are running as expected.",
				// 								timestamp: "2024-09-05T15:08:00Z",
				// 							},
				// 						],
				// 						affected_components: ["app.eu.snyk.io"],
				// 					}),
				// 				},
				// 			],
				// 		},
				// 		{
				// 			role: "user",
				// 			content: [
				// 				{
				// 					type: "text",
				// 					text: `
				// 						original-publish-date: ${eventData.original_pub_date}
				// 						title: ${eventData?.title}
				// 						description: ${eventData?.raw_description}
				// 					`,
				// 				},
				// 			],
				// 		},
				// 	],
				// });

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// const result = JSON.parse(msg.content[0].text) as SummarizedEvent; // Anthropic

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				const geminiResult = await model.generateContent(GEMINI_SYSTEM_PROMPT);

				const result = JSON.parse(
					geminiResult.response.text(),
				) as SummarizedEvent;

				const { updatedEvents, totalAccumulatedMinutes } = processEvents(
					result.parsed_events,
				);

				return {
					...result,
					parsed_events: updatedEvents,
					total_accumulated_minutes: totalAccumulatedMinutes,
				};
			},
		);

		await step.run("upsert-event", () =>
			updateServiceEvent(supabase, eventId, summarizedEvent),
		);

		await step.run("publish-status", () =>
			publishStatusUpdate(eventId, summarizedEvent.recent_status),
		);

		return { success: true, message: "Successfully summarized event" };
	},
);
