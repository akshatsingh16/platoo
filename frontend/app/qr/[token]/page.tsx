"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { startSession } from "@/lib/api"
import { saveSessionToken } from "@/lib/auth"

export default function QrEntryPage() {
  const params = useParams()
  const router = useRouter()
  const qrToken = params.token as string

  const [guestCount, setGuestCount] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleStart = async () => {
    setLoading(true)
    setError("")
    try {
      const session = await startSession({ qrToken, guestCount })
      saveSessionToken(session.sessionToken)
      // Redirect to the customer menu for this restaurant
      router.push(`/menu?restaurantId=${session.restaurantId}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start session. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-2xl shadow-orange-100/50 backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-300/50">
              <span className="text-2xl font-bold text-white">P</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Welcome to your table!</h1>
            <p className="text-center text-sm text-gray-500">
              How many guests are dining today?
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Guest count picker */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-200 text-lg font-bold text-orange-500 transition-colors hover:bg-orange-50"
            >
              −
            </button>
            <span className="w-12 text-center text-3xl font-bold text-gray-900">
              {guestCount}
            </span>
            <button
              onClick={() => setGuestCount(guestCount + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-200 text-lg font-bold text-orange-500 transition-colors hover:bg-orange-50"
            >
              +
            </button>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-300/40 transition-all hover:from-orange-600 hover:to-amber-600 disabled:opacity-60"
          >
            {loading ? "Starting session…" : "Start Ordering →"}
          </button>
        </div>
      </div>
    </div>
  )
}
