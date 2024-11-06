"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "usehooks-ts";

interface ThemeObject {
	currentTheme: string;
	lastUpdated: string;
}

export function ThemeToggle({ className }: { className?: string }) {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();
	const [, setThemeObject] = useLocalStorage<ThemeObject>("themeObject", {
		currentTheme: "light",
		lastUpdated: new Date().toISOString(),
	});

	useEffect(() => {
		setMounted(true);
		setThemeObject((prevState) => ({
			...prevState,
			currentTheme: theme || "light",
		}));
	}, [theme, setThemeObject]);

	const toggleTheme = () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
		setThemeObject({
			currentTheme: newTheme,
			lastUpdated: new Date().toISOString(),
		});
	};

	if (!mounted) {
		return null;
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className={cn("h-7 w-7", className)}
			onClick={toggleTheme}
		>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
