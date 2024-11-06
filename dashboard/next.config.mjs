/** @type {import('next').NextConfig} */
const nextConfig = {
	// async redirects() {
	//   return [
	//     {
	//       source: "/",
	//       destination: "/services",
	//       permanent: true,
	//     },
	//   ];
	// },
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
