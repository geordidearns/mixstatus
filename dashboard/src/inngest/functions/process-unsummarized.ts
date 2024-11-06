import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_ANON_KEY!
);

const processUnsummarizedEvents = async () => {
	const batchSize = 10;

	const { data: events, error } = await supabase
		.from("service_events")
		.select("id")
		.is("summarized_description", null)
		.limit(batchSize);

	if (error) {
		console.error("Error fetching unsummarized events:", error);
		return;
	}

	if (!events?.length) {
		console.log("No unsummarized events found");
		return;
	}

	console.log(`Processing ${events.length} unsummarized events`);

	for (const event of events) {
		try {
			await inngest.send({
				name: "summarize-event",
				data: { event_id: event.id },
			});

			console.log(`Queued summarization for event ${event.id}`);
		} catch (error) {
			console.error(`Failed to queue event ${event.id}:`, error);
		}
	}

	return events.length;
};

export const processBatchOfEvents = inngest.createFunction(
	{ id: "process-batch-of-events" },
	{ event: "process-unsummarized" },
	async ({ step }) => {
		const processedCount = await step.run("process-events", async () => {
			return await processUnsummarizedEvents();
		});

		return {
			success: true,
			processed: processedCount || 0,
			message: processedCount
				? `Processed ${processedCount} events`
				: "No events to process",
		};
	}
);
