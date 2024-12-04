import "@/app/globals.css";

export default async function ServiceLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
