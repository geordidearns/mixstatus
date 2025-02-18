import { EventSchemas, Inngest } from "inngest";

type SummarizeEvent = {
	data: {
		event_id: string;
	};
};

type FeedProcessing = {
	data: {
		service_id: string;
	};
};

type IncidentIoFeedProcessing = {
	data: {
		service_id: string;
	};
};

type ProcessUnsummarizedEvents = {
	data: object;
};

type ProcessTimespanEvents = {
	data: object;
};

type SummarizeTimespanEvent = {
	data: {
		event_id: string;
	};
};

type Events = {
	"summarize-event": SummarizeEvent;
	"feed-processing": FeedProcessing;
	"process-unsummarized": ProcessUnsummarizedEvents;
	"process-timespan-events": ProcessTimespanEvents;
	"summarize-timespan-event": SummarizeTimespanEvent;
	"incident-io-feed-processing": IncidentIoFeedProcessing;
};

export const inngest = new Inngest({
	id: "mixstatus",
	schemas: new EventSchemas().fromRecord<Events>(),
});
