import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',   // 🔥 REQUIRED
  images: {
    unoptimized: true, // 🔥 REQUIRED for export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'x9zw-ryaz-xvbo.s2.xano.io',
      },
    ],
  },
};

export default nextConfig;
