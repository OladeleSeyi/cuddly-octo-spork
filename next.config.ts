import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    emotion: false,
    reactRemoveProperties: false,
    removeConsole: false,
    styledComponents: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
