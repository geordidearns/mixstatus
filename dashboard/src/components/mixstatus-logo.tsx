import * as React from "react";

interface MixstatusLogoProps {
	size?: number;
}

const MixstatusLogo = ({ size = 326 }: MixstatusLogoProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		fill="none"
		viewBox="0 0 326 326"
		className="text-black dark:text-white"
	>
		<rect width="62" height="62" fill="currentColor" rx="8"></rect>
		<rect width="62" height="62" y="66" fill="currentColor" rx="8"></rect>
		<rect width="62" height="62" y="132" fill="currentColor" rx="8"></rect>
		<rect width="62" height="62" y="198" fill="currentColor" rx="8"></rect>
		<rect width="62" height="62" y="264" fill="currentColor" rx="8"></rect>
		<rect
			width="62"
			height="62"
			x="66"
			y="66"
			fill="currentColor"
			rx="8"
		></rect>
		<rect
			width="62"
			height="62"
			x="66"
			y="132"
			fill="currentColor"
			rx="8"
		></rect>
		<rect
			width="62"
			height="62"
			x="132"
			y="132"
			fill="currentColor"
			rx="8"
		></rect>
		<rect
			width="62"
			height="62"
			x="132"
			y="198"
			fill="currentColor"
			rx="8"
		></rect>
		<rect
			width="62"
			height="62"
			x="198"
			y="66"
			fill="currentColor"
			rx="8"
		></rect>
		<rect
			width="62"
			height="62"
			x="198"
			y="132"
			fill="currentColor"
			rx="8"
		></rect>
		<rect width="62" height="62" x="264" fill="currentColor" rx="8"></rect>
		<rect
			width="62"
			height="62"
			x="264"
			y="66"
			fill="currentColor"
			rx="8"
		></rect>
		<rect
			width="62"
			height="62"
			x="264"
			y="132"
			fill="currentColor"
			rx="8"
		></rect>
		<rect
			width="62"
			height="62"
			x="264"
			y="198"
			fill="currentColor"
			rx="8"
		></rect>
		<rect
			width="62"
			height="62"
			x="264"
			y="264"
			fill="currentColor"
			rx="8"
		></rect>
	</svg>
);

export default MixstatusLogo;
