"use client";

import { Loader2, Plus, ArrowRight, Save } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type StatusType = "default" | "pending" | "update" | "success";

const STATUS_CONFIG = {
	default: {
		icon: <Plus className="h-4 w-4" />,
		label: "Save dashboard",
		variant: undefined,
	},
	pending: {
		icon: <Loader2 className="h-4 w-4 animate-spin" />,
		label: "Saving now",
		variant: undefined,
	},
	update: {
		icon: <Save className="h-4 w-4" />,
		label: "Update",
		variant: "default" as const,
	},
	success: {
		icon: <ArrowRight className="h-4 w-4" />,
		label: "View dashboard",
		variant: "default" as const,
	},
} as const;

interface StatusButtonProps {
	status: StatusType;
	action?: () => void;
}

export const CreateDashboardButton = ({
	status,
	action,
}: StatusButtonProps) => {
	const config = STATUS_CONFIG[status];

	return (
		<Button
			variant={config?.variant ?? undefined}
			size="sm"
			onClick={action}
			className="flex-1 gap-2 px-4 text-md font-semibold text-primary-foreground dark:text-primary transition-colors relative"
		>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={status}
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0, opacity: 0 }}
					transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
				>
					{config?.icon}
				</motion.span>
			</AnimatePresence>

			<div className="overflow-hidden relative flex-1">
				<div className="overflow-hidden">
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={status}
							initial={{ x: (status === "pending" ? -1 : 1) * 48, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: (status === "pending" ? -1 : 1) * 48, opacity: 0 }}
							transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
							className="line-clamp-1 block" // added block
						>
							{config?.label}
						</motion.span>
					</AnimatePresence>
				</div>
			</div>
		</Button>
	);
};
