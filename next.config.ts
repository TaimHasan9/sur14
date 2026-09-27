import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output = small Docker image for easy VPS deploy
  output: "standalone",
  images: {
    // Product photos come from these CDNs (remote patterns allow next/image anywhere)
    remotePatterns: [
      { protocol: "https", hostname: "adminapi.applegadgetsbd.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // The storefront catalog is big but static — keep builds fast
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
