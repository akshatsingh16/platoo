// ═══════════════════════════════════════════════════════════════════
// Plato — LAN address detection (server-side only)
// Used so QR codes point at an address phones on the same Wi-Fi can reach,
// instead of "localhost" (which on a phone means the phone itself).
// ═══════════════════════════════════════════════════════════════════

import os from "node:os"

// Adapters that are never reachable from a phone on the same network
const VIRTUAL_ADAPTER = /(vEthernet|VirtualBox|VMware|WSL|Hyper-V|Docker|Loopback|Tailscale|ZeroTier|vpn)/i

function isPrivateIPv4(ip: string): boolean {
  return (
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  )
}

/** All non-internal LAN IPv4 addresses of this machine, best candidates first. */
export function getLanIPv4Addresses(): string[] {
  const candidates: { ip: string; score: number }[] = []

  for (const [name, infos] of Object.entries(os.networkInterfaces())) {
    for (const info of infos ?? []) {
      if (info.family !== "IPv4" || info.internal) continue
      if (info.address.startsWith("169.254.")) continue // link-local, unusable

      let score = 0
      if (isPrivateIPv4(info.address)) score += 2
      if (!VIRTUAL_ADAPTER.test(name)) score += 1
      if (/wi-?fi|wlan|wireless|ethernet|en\d/i.test(name)) score += 1

      candidates.push({ ip: info.address, score })
    }
  }

  return candidates.sort((a, b) => b.score - a.score).map((c) => c.ip)
}

/** The single best LAN IPv4 address, or null if none is found. */
export function getLanIPv4(): string | null {
  return getLanIPv4Addresses()[0] ?? null
}
