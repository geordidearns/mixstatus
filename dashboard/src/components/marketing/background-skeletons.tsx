const DOT_COLORS = [
	"bg-red-500", // critical
	"bg-orange-500", // major
	"bg-yellow-500", // minor
	"bg-blue-500", // maintenance
] as const;

// Move this outside component
const TOTAL_CARDS = 50;
const DOTS_PER_CARD = 14;

// Generate static data for all cards
const staticCards = Array.from({ length: TOTAL_CARDS }).map(() =>
	Array.from({ length: DOTS_PER_CARD }).map(() => ({
		isColored: Math.random() > 0.8,
		colorClass:
			Math.random() > 0.8
				? DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)]
				: "bg-border",
		shouldPing: Math.random() > 0.8,
	})),
);

export function BackgroundSkeletons() {
	return (
		<div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none opacity-50 z-0">
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-full max-w-[2000px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
					{staticCards.map((dots, i) => (
						<div
							key={i}
							className="flex flex-col border p-3 rounded-md bg-sidebar dark:bg-card text-card-foreground gap-4"
						>
							<div className="flex justify-between items-center">
								<div className="flex items-center space-x-2">
									<div className="h-5 w-5 rounded-full bg-border animate-pulse" />
									<span className="h-3 w-24 bg-border rounded animate-pulse" />
								</div>
							</div>
							<div className="flex justify-between">
								{dots.map((dot, j) => (
									<div key={j} className="relative h-2 w-2">
										<div
											className={`absolute h-2 w-2 rounded ${dot.colorClass}`}
										/>
										{dot.isColored && dot.shouldPing && (
											<div
												className={`absolute h-2 w-2 rounded ${dot.colorClass} animate-ping`}
											/>
										)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}