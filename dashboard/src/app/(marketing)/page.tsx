import { BackgroundSkeletons } from "@/components/marketing/background-skeletons"
import { JoinWaitlistForm } from "@/components/marketing/join-waitlist-form"

export default function MarketingPage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 relative bg-background">
			<BackgroundSkeletons />
			<div className="max-w-3xl mx-auto text-center space-y-8 sm:space-y-12 z-10 p-4 backdrop-blur-sm bg-background/10 rounded-lg">
				<div className="flex justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-12 w-12"
						viewBox="0 0 326 326"
						fill="none"
					>
						<rect width="62" height="62" fill="#fff" rx="8"></rect>
						<rect width="62" height="62" y="66" fill="#fff" rx="8"></rect>
						<rect width="62" height="62" y="132" fill="#fff" rx="8"></rect>
						<rect width="62" height="62" y="198" fill="#fff" rx="8"></rect>
						<rect width="62" height="62" y="264" fill="#fff" rx="8"></rect>
						<rect
							width="62"
							height="62"
							x="66"
							y="66"
							fill="#fff"
							rx="8"
						></rect>
						<rect
							width="62"
							height="62"
							x="66"
							y="132"
							fill="#fff"
							rx="8"
						></rect>
						<rect
							width="62"
							height="62"
							x="132"
							y="132"
							fill="#fff"
							rx="8"
						></rect>
						<rect
							width="62"
							height="62"
							x="132"
							y="198"
							fill="#fff"
							rx="8"
						></rect>
						<rect
							width="62"
							height="62"
							x="198"
							y="66"
							fill="#fff"
							rx="8"
						></rect>
						<rect
							width="62"
							height="62"
							x="198"
							y="132"
							fill="#fff"
							rx="8"
						></rect>
						<rect width="62" height="62" x="264" fill="#fff" rx="8"></rect>
						<rect
							width="62"
							height="62"
							x="264"
							y="66"
							fill="#fff"
							rx="8"
						></rect>
						<rect
							width="62"
							height="62"
							x="264"
							y="132"
							fill="#fff"
							rx="8"
						></rect>
						<rect
							width="62"
							height="62"
							x="264"
							y="198"
							fill="#fff"
							rx="8"
						></rect>
						<rect
							width="62"
							height="62"
							x="264"
							y="264"
							fill="#fff"
							rx="8"
						></rect>
					</svg>
				</div>
				{/* Hero Title */}
				<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-normal text-foreground leading-tight sm:leading-tight md:leading-tight">
					Monitor the services your company{" "}
					<span className="bg-highlight rounded-sm box-decoration-clone px-1 py-0.5">
						relies on
					</span>
				</h1>

				{/* Sub Text */}
				<p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-6">
					Track the B2B services your company relies on and get notified in
					real-time when they are experiencing issues.
				</p>

				{/* Email Input and Button */}
				<div className="flex w-full max-w-md mx-auto px-4 sm:px-0 relative">
          <JoinWaitlistForm />
        </div>
			</div>
		</main>
	);
}
