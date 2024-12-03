/* eslint-disable @typescript-eslint/no-explicit-any */
import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_ANON_KEY!,
);

const parser: Parser = new Parser();

type FeedItem = {
	title: string;
	description: string;
	link: string;
	pubDate: string;
	guid: string;
	isoDate: string;
};

type Service = {
	id: string;
	feed_url: string;
};

type ProcessedFeed = {
	serviceId: string;
	items: FeedItem[];
};

export const feedProcessor = inngest.createFunction(
	{ id: "feed-processing" },
	{ event: "feed-processing" },
	async ({ event, step }) => {
		const serviceId = event.data.service_id;
		const services = await fetchServices(step, serviceId);
		const serviceFeedItems = await processFeedsForServices(step, services);
		const updatedRecords = await updateRecords(step, serviceFeedItems);

		return generateSummary(services, serviceFeedItems, updatedRecords);
	},
);

async function fetchServices(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	step: any,
	serviceId?: string,
): Promise<Service[]> {
	return step.run(`fetch-services`, async () => {
		let query = supabase.from("services").select("id, feed_url");

		if (serviceId) {
			query = query.eq("id", serviceId);
		}

		const { data } = await query;

		return data;
	});
}

async function processFeedsForServices(
	step: any,
	services: Service[],
): Promise<ProcessedFeed[]> {
	return step.run("process-feeds", async () => {
		const items = await Promise.all(services?.map(processFeedForService));
		return items.filter((item) => item?.items?.length > 0);
	});
}

async function processFeedForService(service: Service): Promise<ProcessedFeed> {
	try {
		const result = await parser.parseURL(service.feed_url);
		return {
			serviceId: service.id,
			items: result.items.slice(0, 50).map(mapFeedItem),
		};
	} catch (error) {
		console.error(`Error processing feed for service ${service.id}:`, error);
		return {
			serviceId: service.id,
			items: [],
		};
	}
}

function mapFeedItem(item: any): FeedItem {
	return {
		title: item.title,
		description: item.content,
		link: item.link,
		pubDate: item.pubDate,
		guid: item.guid,
		isoDate: item.isoDate,
	};
}

async function updateRecords(
	step: any,
	serviceFeedItems: ProcessedFeed[],
): Promise<any[]> {
	return step.run("update-records", async () => {
		const results = await Promise.all(
			serviceFeedItems.flatMap(({ serviceId, items }) =>
				Promise.all(items.map((item) => upsertServiceEvent(serviceId, item))),
			),
		);
		return results.flat().filter(Boolean);
	});
}

async function fetchHtmlContent(url: string): Promise<string | null> {
	const apiKey = process.env.SCRAPINGANT_API_KEY;
	const encodedUrl = encodeURIComponent(url);
	const apiUrl = `https://api.scrapingant.com/v2/extended?url=${encodedUrl}&x-api-key=${apiKey}&proxy_country=GB`;

	try {
		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		return data.text;
	} catch (error) {
		console.error("Error fetching HTML content:", error);
		return null;
	}
}

async function upsertServiceEvent(
	serviceId: string,
	item: FeedItem,
): Promise<any | null> {
	const description = await fetchHtmlContent(item.guid);

	const { data, error } = await supabase.rpc("upsert_service_event_v4", {
		p_service_id: serviceId,
		p_guid: item.guid,
		p_title: item.title,
		p_raw_description: description,
		p_pub_date: item.isoDate,
	});

	if (error) {
		console.error("Error upserting event:", error);
		return null;
	}

	return data;
}

function generateSummary(
	services: Service[],
	serviceFeedItems: ProcessedFeed[],
	updatedRecords: any[],
) {
	const totalServices = services.length;
	const totalFeedItems = serviceFeedItems.reduce(
		(sum, service) => sum + service.items.length,
		0,
	);
	const serviceFeedItemsString = JSON.stringify(serviceFeedItems);
	const payloadSizeInMB =
		Buffer.byteLength(serviceFeedItemsString, "utf8") / (1024 * 1024);

	return {
		totalServices,
		totalFeedItems,
		updatedRecordsCount: updatedRecords.length,
		processingPayload: `${payloadSizeInMB.toFixed(2)}MB`,
	};
}
