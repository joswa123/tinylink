import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   env: {
    // Use Vercel's environment variable for the app URL
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  },
  // Enable static exports if needed (optional)
  trailingSlash: true,
  // Optimize for Vercel
  images: {
    unoptimized: true, // If you're not using Next.js Image optimization
  },
};

export default nextConfig;
