import "@/app/globals.css";
import { Metadata } from "next";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
	description: "External provider monitoring and alerts",
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
			</body>
		</html>
	);
}
