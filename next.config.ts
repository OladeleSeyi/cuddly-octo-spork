import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    emotion: false,
    reactRemoveProperties: false,
    removeConsole: false,
    styledComponents: false,
  },
};

export default nextConfig;
