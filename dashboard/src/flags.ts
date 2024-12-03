import { unstable_flag as flag } from "@vercel/flags/next";

export const showHeader = flag({
	key: "show-header",
	decide: () => true,
});

export const showServiceToggle = flag({
	key: "show-service-toggle",
	decide: () => false,
});
