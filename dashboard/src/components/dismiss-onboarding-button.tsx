"use client";

import { dismissOnboarding } from "@/actions/dismiss-onboarding";
import { Button } from "@/components/ui/button";

export function DismissButton() {
	return (
		<Button
			variant="ghost"
			onClick={() => dismissOnboarding()}
			className="flex-1"
		>
			I&apos;m all good
		</Button>
	);
}
