import "@/app/globals.css";
import { Metadata } from "next";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const geistSans = localFont({
	src: "../fonts/GeistVF.woff", // Updated path
	variable: "--font-geist-sans",
	weight: "100 900",
	display: "swap",
	preload: true,
});

const geistMono = localFont({
	src: "../fonts/GeistMonoVF.woff", // Updated path
	variable: "--font-geist-mono",
	weight: "100 900",
	display: "swap",
	preload: true,
});

export const metadata: Metadata = {
	title: "mixstatus",
	description: "Monitor disruptions in services you depend on",
	icons: {
		icon: "./favicon.ico",
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
				{children}
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
