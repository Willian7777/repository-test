import type { NextConfig } from "next";

// Proxy SSL corporativo — desabilita verificação apenas em dev local
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "web.poecdn.com" },
      { protocol: "https", hostname: "**.poecdn.com" },
    ],
  },
};

export default nextConfig;
