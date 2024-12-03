"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { setThemeAction } from "@/actions/set-theme";

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme();

	const toggleTheme = async () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
		await setThemeAction({ theme: newTheme });
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className={cn(
				"h-8 w-8 rounded-full hover:bg-sidebar dark:hover:bg-card",
				className,
			)}
			onClick={toggleTheme}
		>
			<Sun
				className={cn(
					"h-[1.2rem] w-[1.2rem] transition-all text-muted-foreground",
					"rotate-0 scale-100 dark:-rotate-90 dark:scale-0",
				)}
			/>
			<Moon
				className={cn(
					"absolute h-[1.2rem] w-[1.2rem] transition-all text-muted-foreground",
					"rotate-90 scale-0 dark:rotate-0 dark:scale-100",
				)}
			/>
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
