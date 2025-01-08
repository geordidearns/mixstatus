// export const runtime = "edge";

import "@/app/globals.css";
import { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { geistSans, geistMono } from "@/lib/fonts";
import Providers from "./providers";

export const viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#ffffff",
};

export const metadata: Metadata = {
	title: "mixstatus",
	description: "Monitor disruptions in services you depend on.",
	icons: {
		icon: "./icon.ico",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
				suppressHydrationWarning
			>
				<Providers>
					<NuqsAdapter>{children}</NuqsAdapter>
				</Providers>

				<Suspense>
					<SpeedInsights />
					<Analytics />
				</Suspense>
			</body>
		</html>
	);
}
