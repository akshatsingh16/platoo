import type { NextConfig } from "next"
import { getLanIPv4Addresses } from "./lib/network"

const nextConfig: NextConfig = {
  // Allow accessing Next.js dev server over LAN / IP addresses (e.g. mobile testing).
  // LAN IPs are detected at startup so this keeps working when your network IP changes.
  allowedDevOrigins: ["localhost", "127.0.0.1", ...getLanIPv4Addresses()],

  // Proxy API calls to the Spring Boot backend during development.
  // This avoids CORS issues — the browser sees the request as same-origin.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/api/v1/:path*",
      },
    ]
  },
}

export default nextConfig
