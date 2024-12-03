"use client";

import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { requestService } from "@/actions/request-service";

interface NoResultsFoundProps {
	searchValue: string;
}

export function NoResultsFound({ searchValue }: NoResultsFoundProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const lastSubmittedValueRef = useRef<string | null>(null);

	const canSubmit = searchValue !== lastSubmittedValueRef.current;

	return (
		<div className="flex flex-col items-center justify-center py-12 text-center gap-4">
			<MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
			<h3 className="text-lg font-medium text-foreground">
				{`Help mixstatus improve by requesting '${searchValue}' or another service`}
			</h3>
			<p className="text-sm text-muted-foreground">
				We can improve the coverage of services when you request them
			</p>
			<Button
				className="font-sans bg-indigo-500 text-white hover:bg-indigo-600 mt-4 font-mono w-48 flex items-center justify-center"
				onClick={async () => {
					try {
						setIsSubmitting(true);
						await requestService({ searchValue });
						lastSubmittedValueRef.current = searchValue;
						toast.success("Service requested successfully");
					} catch (error) {
						console.error(error);
					} finally {
						setIsSubmitting(false);
					}
				}}
				disabled={isSubmitting || !canSubmit}
			>
				{isSubmitting ? (
					<>
						Saving request
						<Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
					</>
				) : (
					"Request service"
				)}
			</Button>
		</div>
	);
}
