/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/app",
				destination: "/",
				permanent: true,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.logo.dev",
				port: "",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
