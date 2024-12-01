import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			enableSystem={false}
			forcedTheme="dark"
		>
			<div className="marketing-layout">{children}  <Toaster /></div>
		</ThemeProvider>
	);
}
