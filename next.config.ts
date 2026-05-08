import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      {
        source: "/kyc/car-allocation-pending",
        destination: "/car-allocation/pending",
        permanent: true,
      },
      {
        source: "/kyc/car-allocation-confirmed",
        destination: "/car-allocation/confirmed",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/**",
      },
    ],
  },
};

export default nextConfig;
