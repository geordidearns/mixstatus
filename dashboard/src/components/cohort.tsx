"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { subWeeks, subMonths, startOfWeek, format } from "date-fns";

// Generate sample data for the last 24 weeks (to have enough data for 6 months)
const generateSampleData = () => {
	const weeks = [];
	for (let i = 23; i >= 0; i--) {
		const weekStart = startOfWeek(subWeeks(new Date(), i));
		const weekData = {
			week: format(weekStart, "MMM d, yyyy"),
			days: Array(7)
				.fill(0)
				.map((_, index) => {
					const baseEvents =
						index < 5
							? Math.floor(Math.random() * 50) + 50
							: Math.floor(Math.random() * 30) + 10;
					return baseEvents;
				}),
		};
		weeks.push(weekData);
	}
	return weeks;
};

const cohortData = generateSampleData();

const getColorIntensity = (value: number, max: number) => {
	const intensity = Math.floor((value / max) * 255);
	return `rgb(0, 0, ${intensity})`;
};

const CohortAnalysis = () => {
	const [timeRange, setTimeRange] = useState("3months");

	const filteredData = useMemo(() => {
		const now = new Date();
		let cutoffDate;

		switch (timeRange) {
			case "1week":
				cutoffDate = subWeeks(now, 1);
				break;
			case "1month":
				cutoffDate = subMonths(now, 1);
				break;
			case "3months":
				cutoffDate = subMonths(now, 3);
				break;
			case "6months":
				cutoffDate = subMonths(now, 6);
				break;
			default:
				cutoffDate = subMonths(now, 3);
		}

		return cohortData.filter((week) => new Date(week.week) >= cutoffDate);
	}, [timeRange]);

	const maxValue = Math.max(...filteredData.flatMap((week) => week.days));

	const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Event Analysis</CardTitle>
				<Select value={timeRange} onValueChange={setTimeRange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select time range" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1week">Last Week</SelectItem>
						<SelectItem value="1month">Last Month</SelectItem>
						<SelectItem value="3months">Last 3 Months</SelectItem>
						<SelectItem value="6months">Last 6 Months</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-32 py-2">Week</TableHead>
							{daysOfWeek.map((day, index) => (
								<TableHead key={index} className="text-center py-2 px-1 text-xs">
									{day}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredData.map((week, weekIndex) => (
							<TableRow key={weekIndex}>
								<TableCell className="py-1 text-sm">{week.week}</TableCell>
								{week.days.map((events, dayIndex) => (
									<TableCell
										key={dayIndex}
										style={{
											backgroundColor: getColorIntensity(events, maxValue),
											color: events > maxValue / 2 ? "white" : "black",
										}}
										className="text-center py-1 px-1 text-xs"
									>
										{events}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};

export default CohortAnalysis;
