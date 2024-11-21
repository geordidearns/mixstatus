import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { feedProcessor } from "../../../inngest/functions/feed-processor";
import { summarizeEvent } from "../../../inngest/functions/summarize-event";
import { processBatchOfEvents } from "@/inngest/functions/process-unsummarized";

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [feedProcessor, summarizeEvent, processBatchOfEvents],
});
