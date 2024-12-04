/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/images/:all*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/fonts/:all*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
	async redirects() {
		return [
			{
				source: "/",
				destination: "/status",
				permanent: true,
			},
		];
	},

	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 60,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.logo.dev",
				port: "",
				pathname: "/**",
			},
		],
	},
	experimental: {
		optimizePackageImports: ["@radix-ui/react-icons", "@heroicons/react"],
	},
};

export default nextConfig;
