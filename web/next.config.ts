import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: [
      "recharts",
      "framer-motion",
      "gsap",
      "lenis",
      "react-hot-toast",
    ],
  },
  turbopack: {},
  // Suppress Three.js build warnings
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
