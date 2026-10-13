"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { login } from "@/lib/api"
import { saveAuth } from "@/lib/auth"

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect") || "/dashboard"
  const sessionExpired = searchParams.get("error") === "session_expired"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(
    sessionExpired ? "Your session has expired. Please log in again." : "",
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await login({ email, password })
      saveAuth(response)
      window.location.href = redirectTarget
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please check credentials.",
      )
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("password123")
    setError("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-100/20 blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-2xl shadow-orange-100/50 backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-300/50">
              <span className="text-2xl font-bold text-white">P</span>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Welcome to Plato
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Sign in to manage your restaurant
              </p>
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="mb-5 rounded-xl border border-orange-100 bg-orange-50/60 p-3">
            <p className="mb-2 text-[11px] font-semibold text-orange-800">
              Quick Demo Logins (Click to autofill):
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin@plato.com")}
                className="rounded-lg border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-medium text-orange-700 shadow-sm transition hover:bg-orange-100"
              >
                👑 Owner / Admin (admin@plato.com)
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("priya.manager@demo.plato.com")}
                className="rounded-lg border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-medium text-orange-700 shadow-sm transition hover:bg-orange-100"
              >
                👔 Staff (priya.manager@...)
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@plato.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-2.5 text-xs text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-2.5 text-xs text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-300/40 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-center text-[10px] text-gray-400">
            Plato Restaurant Management Platform
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-orange-50" />}>
      <LoginForm />
    </Suspense>
  )
}
