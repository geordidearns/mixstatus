import { EventSchemas, Inngest } from "inngest";

type SummarizeEvent = {
	data: {
		event_id: string;
	};
};
type Events = {
	"summarize-event": SummarizeEvent;
	"feed-processing": { data: object };
};

export const inngest = new Inngest({
	id: "mixstatus",
	schemas: new EventSchemas().fromRecord<Events>(),
});
