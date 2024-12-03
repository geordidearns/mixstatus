// Import the NextResponse & NextRequest utility to create and modify responses
import { NextResponse, NextRequest } from "next/server";

// Define middleware function that runs before requests are completed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
	// Create a new response object for the next middleware/route handler
	const response = NextResponse.next();

	// CACHE CONTROL HEADERS
	response.headers.set(
		"Cache-Control",
		[
			"public", // Allow caching by browsers and CDNs
			"s-maxage=3600", // Cache on CDN for 1 hour (3600 seconds)
			"stale-while-revalidate=59", // Use stale content for 59 seconds while fetching new content
		].join(", "),
	);

	// SECURITY HEADERS
	// Force HTTPS for 1 year (31536000 seconds) including subdomains
	response.headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains",
	);

	// Prevent site from being embedded in iframes using CSP frame-ancestors (modern replacement for X-Frame-Options)
	response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");

	// Prevent browser from MIME-type sniffing (security feature)
	response.headers.set("X-Content-Type-Options", "nosniff");

	// Control how much referrer information is included with requests
	response.headers.set("Referrer-Policy", "origin-when-cross-origin");

	// PERFORMANCE HEADERS
	// Enable 103 Early Hints for supported browsers
	response.headers.set("Early-Hints", "103");

	// Add Server-Timing headers for performance monitoring
	response.headers.set(
		"Server-Timing",
		[
			'cdn-cache;desc="MISS"', // Indicates a CDN cache miss
			"edge;dur=1", // Edge computation took 1ms
			"origin;dur=100", // Origin server took 100ms
		].join(", "),
	);

	// Return the modified response
	return response;
}

// Middleware configuration
export const config = {
	// Define which routes this middleware applies to using a matcher
	matcher: [
		// Regular expression pattern:
		// / - starts with slash
		// (?!pattern) - negative lookahead (don't match these patterns)
		// api|_next/static|_next/image|favicon.ico - exclude these paths
		// .* - match everything else
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
