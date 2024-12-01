import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cookies } from "next/headers";

import { DismissButton } from "./dismiss-onboarding-button";

interface OnboardingCardProps {
	title: string;
	description: string;
	onShowMeHow?: () => void;
}

const ONBOARDING_COOKIE_NAME = "dismissed-onboarding";

export async function OnboardingCard({
	title,
	description,
	onShowMeHow,
}: OnboardingCardProps) {
	const cookieStore = await cookies();
	const dismissed = cookieStore.get(ONBOARDING_COOKIE_NAME)?.value === "true";

	if (dismissed) return null;

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">{description}</p>
			</CardContent>
			<CardFooter className="flex justify-between gap-4">
				<form action={onShowMeHow}>
					<Button type="submit" className="flex-1">
						Show me how
					</Button>
				</form>
				<DismissButton />
			</CardFooter>
		</Card>
	);
}
