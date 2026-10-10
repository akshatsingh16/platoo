import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
