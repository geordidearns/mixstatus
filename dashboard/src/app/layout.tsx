import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
// import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/lib/react-query/provider";
import { cookies } from "next/headers";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "basestatus",
	description: "External provider monitoring and alerts",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const sidebarState = cookies().get("sidebar:state");

	let defaultOpen = false;
	if (sidebarState) {
		defaultOpen = sidebarState.value === "true";
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
				suppressHydrationWarning
			>
				<ReactQueryProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
						storageKey="ui-theme"
					>
						<div suppressHydrationWarning>
							<SidebarProvider defaultOpen={defaultOpen}>
								<AppSidebar />
								<SidebarInset>
									<main className="relative z-0">{children}</main>
								</SidebarInset>
							</SidebarProvider>
						</div>
						<Toaster />
					</ThemeProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
