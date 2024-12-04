import "@/app/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/lib/react-query/provider";
// import { cookies } from "next/headers";

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// const sidebarState = (await cookies()).get("sidebar:state");

	// let defaultOpen = false;
	// if (sidebarState) {
	// 	defaultOpen = sidebarState.value === "true";
	// }

	return (
		<>
			<ReactQueryProvider>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
					storageKey="ui-theme"
				>
					<div suppressHydrationWarning>
						<SidebarProvider defaultOpen={false}>
							<AppSidebar />
							<SidebarInset>
								<main className="relative z-0">{children}</main>
							</SidebarInset>
						</SidebarProvider>
					</div>
					<Toaster />
				</ThemeProvider>
			</ReactQueryProvider>
		</>
	);
}
