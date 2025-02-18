import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { feedProcessor } from "../../../../inngest/functions/feed-processor";
import { summarizeEvent } from "../../../../inngest/functions/summarize-event";
import { processBatchOfEvents } from "@/inngest/functions/process-unsummarized";
import { processTimespanEvents } from "@/inngest/functions/process-timespan-events";
import { summarizeTimespanEvent } from "@/inngest/functions/summarize-timespan-event";
import { feedProcessor as incidentIoFeedProcessor } from "@/inngest/functions/incident-io-feed-processor";

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [
		feedProcessor,
		summarizeEvent,
		processBatchOfEvents,
		processTimespanEvents,
		summarizeTimespanEvent,
		incidentIoFeedProcessor,
	],
});
