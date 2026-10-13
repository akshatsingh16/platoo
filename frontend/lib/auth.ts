// ═══════════════════════════════════════════════════════════════════
// Plato — Auth helpers (client-side token management)
// ═══════════════════════════════════════════════════════════════════

import type { LoginResponse } from "./types"

const TOKEN_KEY = "plato_token"
const USER_KEY = "plato_user"

export interface AuthUser {
  fullName: string
  role: string
  token: string
}

/** Persist login data after successful authentication */
export function saveAuth(response: LoginResponse): void {
  if (typeof window === "undefined") return

  const user: AuthUser = {
    fullName: response.fullName,
    role: response.role,
    token: response.accessToken,
  }

  localStorage.setItem(TOKEN_KEY, response.accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/** Retrieve the JWT access token */
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

/** Retrieve the authenticated user info */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

/** Check whether the user is authenticated */
export function isAuthenticated(): boolean {
  return !!getToken()
}

/** Clear all auth data and log out */
export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Session Token (for customer dining sessions) ──────────────────

const SESSION_TOKEN_KEY = "plato_session_token"

export function saveSessionToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_TOKEN_KEY, token)
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(SESSION_TOKEN_KEY)
}

export function clearSessionToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_TOKEN_KEY)
}
