import type { NextConfig } from "next";

const configuredApiBase = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://sonali-portfolio-api.onrender.com"
).trim().replace(/\/api\/v1\/?$/i, "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allows local E2E checks through http://127.0.0.1:3000 as well as localhost.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      new URL(`${configuredApiBase}/uploads/**`),
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
