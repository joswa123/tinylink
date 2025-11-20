import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
    env: {
    // Make sure environment variables are available at build time
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Enable static exports if needed (optional)
  trailingSlash: true,
  // Optimize for Vercel
  images: {
    unoptimized: true, // If you're not using Next.js Image optimization
  },
};

export default nextConfig;
