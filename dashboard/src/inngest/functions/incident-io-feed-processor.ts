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

interface SpiderCrawlParams {
	url: string;
	exclude_selector?: string;
	return_format?: "markdown" | "html" | "text";
	depth?: number;
	readability?: boolean;
	country_code?: string;
}

interface SpiderCrawlResponse {
	content: string;
	status: number;
}

export const feedProcessor = inngest.createFunction(
	{ id: "incident-io-feed-processing", concurrency: 1, retries: 1 },
	{
		event: "incident-io-feed-processing",
		// cron: "TZ=Europe/London */5 * * * *" as any,
	},
	async ({ event, step }) => {
		const services = await fetchServices(
			step,
			event.data?.service_id ?? undefined,
		);
		const serviceFeeds = await processFeedsForServices(step, services);

		const enrichedFeeds = await step.run("enrich-feed-items", async () => {
			return Promise.all(
				serviceFeeds.map(async ({ serviceId, items }) => ({
					serviceId,
					items: await Promise.all(
						items.map(async (item) => {
							try {
								const crawlResult = await crawlWebPage({
									url: item.link,
									return_format: "markdown",
								});
								return { ...item, description: crawlResult.content };
							} catch (error) {
								console.error(`Failed to crawl ${item.link}:`, error);
								return item;
							}
						}),
					),
				})),
			);
		});

		await updateRecords(step, enrichedFeeds);
	},
);

async function fetchServices(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	step: any,
	serviceId?: string,
): Promise<Service[]> {
	return step.run(`fetch-services`, async () => {
		let query = supabase
			.from("services")
			.select("id, feed_url")
			.eq("source_provider", "incident-io")
			.eq("source_type", "rss_feed");

		if (serviceId) {
			query = query.eq("id", serviceId);
		}

		const { data } = await query;

		return data;
	});
}

async function processFeedsForServices(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
			items: result.items.slice(0, 5).map(mapFeedItem),
		};
	} catch (error) {
		console.error(`Error processing feed for service ${service.id}:`, error);
		return {
			serviceId: service.id,
			items: [],
		};
	}
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

async function crawlWebPage({
	url,
	exclude_selector = "a",
	return_format = "markdown",
	depth = 0,
	readability = true,
	country_code = "gb",
}: SpiderCrawlParams): Promise<SpiderCrawlResponse> {
	const SPIDER_API_KEY = process.env.SPIDER_API_KEY;

	if (!SPIDER_API_KEY) {
		throw new Error("Spider API key is not configured");
	}

	try {
		const response = await fetch("https://api.spider.cloud/crawl", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${SPIDER_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url,
				exclude_selector,
				return_format,
				depth,
				readability,
				country_code,
			}),
		});

		if (!response.ok) {
			throw new Error(`Spider API request failed: ${response.statusText}`);
		}

		const data = await response.json();
		return data[0];
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to crawl webpage: ${error.message}`);
		}
		throw error;
	}
}

async function updateRecords(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	step: any,
	serviceFeedItems: ProcessedFeed[],
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

async function upsertServiceEvent(
	serviceId: string,
	item: FeedItem,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any | null> {
	const { data, error } = await supabase.rpc("upsert_service_event_v4", {
		p_service_id: serviceId,
		p_guid: item.guid,
		p_title: item.title,
		p_raw_description: item.description,
		p_pub_date: item.isoDate,
	});

	if (error) {
		console.error("Error upserting event:", error);
		return null;
	}

	return data;
}
