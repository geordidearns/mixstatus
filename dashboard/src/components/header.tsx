import MixstatusLogo from "@/components/mixstatus-logo";

export function Header() {
	return (
		<header className="sticky top-0 z-50 flex h-12 shrink-0 justify-center items-center gap-1 border-b px-2 bg-background">
			<div className="flex items-center gap-2">
				<MixstatusLogo size={24} />
			</div>
		</header>
	);
}
