import "@/app/globals.css";
export default async function ServiceLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 ">
			<div className="hidden lg:block lg:col-span-2 rounded-lg p-4">
				{/* Left sidebar content */}
			</div>

			<main className="col-span-1 lg:col-span-8 relative">
				<div className="absolute h-28 sm:h-32 md:h-36 lg:h-40 -mx-[100vw] left-[50vw] right-[50vw] bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] [background-size:16px_16px] border-b border-border ">
					{/* Dotted background section */}
				</div>
				<div className="relative mt-14 sm:mt-16 md:mt-18 lg:mt-20">
					{children}
				</div>
			</main>

			<div className="hidden lg:block lg:col-span-2 rounded-lg p-4">
				{/* Right sidebar content */}
			</div>
		</div>
	);
}
