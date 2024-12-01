"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { joinWaitlist } from "@/actions/join-waitlist"
import { useFormStatus } from "react-dom"
import { useState } from "react"
import { toast } from "sonner"


function SubmitButton() {
	const { pending,  } = useFormStatus();

	return (
		<Button
			size="sm"
			type="submit"
			disabled={pending}
			className="absolute right-[20px] sm:right-[4px] top-[4px] bottom-[4px] rounded-full px-3 sm:px-4 h-[calc(100%-8px)] transition-transform duration-200 text-white"
		>
			{pending ? (
				<span className="flex items-center gap-2">
					<span className="hidden sm:inline">Confirming email</span>
					<span className="sm:hidden">...</span>
					<svg
						className="animate-spin h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				</span>
			) : (
				<>
					<span className="hidden sm:inline">Join waitlist</span>
					<span className="sm:hidden">Join</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="w-4 h-4 ml-1 sm:ml-2"
					>
						<path
							fillRule="evenodd"
							d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
							clipRule="evenodd"
						/>
					</svg>
				</>
			)}
		</Button>
	);
}

export function JoinWaitlistForm() {
  const [email, setEmail] = useState("")

  async function handleSubmit(formData: FormData) {
    const result = await joinWaitlist({
      email: formData.get("email") as string,
    })

    if (result?.data?.success) {
      toast.success("You've been added to the waitlist!")
      setEmail("")
    } else {
      toast.error("Failed to join waitlist, please try again.")
    }
  }

  return (
    <form
      action={handleSubmit}
      className="flex w-full max-w-md mx-auto px-4 sm:px-0 relative"
    >
      <Input
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full h-10 sm:h-12 pl-4 pr-[100px] sm:pr-[120px] rounded-full bg-background border-muted-foreground/20 transition-colors duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 font-mono"
      />
      <SubmitButton />
    </form>
  )
}