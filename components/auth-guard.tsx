"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated, getUser } from "@/lib/auth"

/**
 * AuthGuard — wraps protected pages.
 * Redirects to /login if no JWT is found.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else {
      setChecked(true)
    }
  }, [router, pathname])

  if (!checked) {
    // Show a minimal loading state while checking auth
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f6]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <span className="text-sm text-gray-500">Loading…</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
