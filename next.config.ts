import type { NextConfig } from "next";

const supabaseUrl = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol === "http:" ? "http" : "https",
            hostname: supabaseUrl.hostname,
            pathname: "/storage/v1/object/public/property-images/**",
          },
        ]
      : [],
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "**/globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
