import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable static generation for pages that use Firebase
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
