import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CreateDashboardButton } from "../create-dashboard-button";
import { toast } from "sonner";

// Props interface for the SelectedServicesToast component
interface SelectedServicesProps {
	// Service selection state
	firstSelectedService: string;
	selectedCount: number;

	// Toast and loading states
	activeToastId: string | null;
	isCreating: boolean;
	isUpdating?: boolean;

	// Dashboard-related props
	shouldUpdate?: boolean;
	dashboardId?: string;

	// Callback handlers
	onClear: () => void;
	onCreate: () => void;
	onUpdate?: (dashboardId: string) => void;
}

export function SelectedServicesToast({
	firstSelectedService,
	selectedCount,
	activeToastId,
	isCreating,
	onClear,
	onCreate,
	shouldUpdate,
	isUpdating,
	onUpdate,
	dashboardId,
}: SelectedServicesProps) {
	const router = useRouter();

	// Handle dashboard creation or update action
	const handleAction = () => {
		if (!dashboardId) {
			// Create new dashboard
			onCreate();
		} else if (shouldUpdate) {
			// Update existing dashboard
			onUpdate?.(dashboardId);
		} else {
			// Clear existing toast and navigate to dashboard
			if (activeToastId) {
				toast.dismiss(activeToastId);
			}
			router.push(`/dashboard/${dashboardId}`);
		}
	};

	// Helper function to generate the toast title based on selection
	const getToastTitle = () => {
		if (!activeToastId) return "Selected Providers";

		return selectedCount === 1
			? `Start monitoring ${firstSelectedService} in real-time`
			: `Monitor ${firstSelectedService} and ${selectedCount - 1} ${
					selectedCount - 1 === 1 ? "other in real-time" : "others in real-time"
			  }`;
	};

	// Helper function to determine the create button status
	const getButtonStatus = () => {
		if (isCreating || isUpdating) return "pending";
		if (shouldUpdate) return "update";
		if (dashboardId) return "success";
		return "default";
	};

	return (
		<div className="w-full">
			<h2 className="font-semibold text-md mb-2">{getToastTitle()}</h2>
			<p
				className={`text-${
					!!activeToastId ? "xs" : "sm"
				} text-muted-foreground mb-4`}
			>
				Save your dashboard to know when the providers you rely on face issues.
			</p>
			<div className="flex space-x-2">
				<Button variant="secondary" size="sm" className="flex-1" onClick={onClear}>
					Clear selection
				</Button>
				<CreateDashboardButton
					status={getButtonStatus()}
					action={dashboardId ? handleAction : onCreate}
				/>
			</div>
		</div>
	);
}
