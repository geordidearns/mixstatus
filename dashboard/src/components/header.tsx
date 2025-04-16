import MixstatusLogo from "@/components/mixstatus-logo";
import { SidebarTrigger } from "@/components/ui/sidebar";
export function Header() {
	return (
		<header className="sticky top-0 z-50 flex h-12 shrink-0 gap-1 border-b px-2 bg-background items-center w-full">
			<div className="flex justify-start gap-2">
				<SidebarTrigger />
			</div>
			<div className="justify-end">
				<div className="flex items-center gap-2">
					<MixstatusLogo size={24} />
				</div>
			</div>
		</header>
	);
}
