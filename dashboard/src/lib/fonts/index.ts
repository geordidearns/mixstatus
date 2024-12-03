import localFont from "next/font/local";

export const geistSans = localFont({
	src: "../../fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
	display: "swap",
	preload: true,
	fallback: ["system-ui", "arial"], // Add fallback fonts
});

export const geistMono = localFont({
	src: "../../fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
	display: "swap",
	preload: true,
	fallback: ["monospace"], // Add fallback fonts
});
