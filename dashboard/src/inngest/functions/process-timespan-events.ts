import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_ANON_KEY!
);

const processEvents = async () => {
	const batchSize = 20;
	let totalProcessed = 0;
	let hasMore = true;

	while (hasMore) {
		const { data: events, error } = await supabase
			.from("service_events")
			.select("id")
			.not("raw_description", "is", null)
			.eq("accumulated_time_minutes", 0)
			.limit(batchSize);

		if (error) {
			console.error("Error fetching unsummarized events:", error);
			break;
		}

		if (!events?.length) {
			console.error("No more unsummarized events found");
			hasMore = false;
			break;
		}

		console.log(`Processing batch of ${events.length} timespan events`);

		// Process all events in current batch concurrently
		await Promise.all(
			events.map(async (event) => {
				try {
					await inngest.send({
						name: "summarize-timespan-event",
						data: { event_id: event.id },
					});
					console.log(`Queued summarization for event ${event.id}`);

					// Wait for summarization to complete
					while (true) {
						const { data: updated } = await supabase
							.from("service_events")
							.select("accumulated_time_minutes")
							.eq("id", event.id)
							.single();

						if (updated?.accumulated_time_minutes !== 0) {
							console.log(`Summarization completed for event ${event.id}`);
							break;
						}
						await new Promise((resolve) => setTimeout(resolve, 1000));
					}
				} catch (error) {
					console.error(`Failed to process event ${event.id}:`, error);
				}
			})
		);

		totalProcessed += events.length;

		if (events.length < batchSize) {
			hasMore = false;
		} else {
			// Wait 5 seconds before processing next batch
			await new Promise((resolve) => setTimeout(resolve, 10000));
		}
	}

	return totalProcessed;
};

export const processTimespanEvents = inngest.createFunction(
	{ id: "process-timespan-events" },
	{ event: "process-timespan-events" },
	async ({ step }) => {
		const processedCount = await step.run("process-events", async () => {
			return await processEvents();
		});

		return {
			success: true,
			processed: processedCount || 0,
			message: processedCount
				? `Processed ${processedCount} timespan events`
				: "No timespan events to process",
		};
	}
);
