import { getLanIPv4 } from "@/lib/network"

/**
 * GET /api/network
 * Returns the origin phones on the same network should use to reach this app.
 * Priority: NEXT_PUBLIC_APP_URL (if set) → detected LAN IP → request origin.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)

  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "")
  if (configured) {
    return Response.json({ publicOrigin: configured, source: "env" })
  }

  const lanIp = getLanIPv4()
  if (lanIp) {
    const port = requestUrl.port ? `:${requestUrl.port}` : ""
    return Response.json({
      publicOrigin: `${requestUrl.protocol}//${lanIp}${port}`,
      source: "lan",
    })
  }

  return Response.json({ publicOrigin: requestUrl.origin, source: "request" })
}
