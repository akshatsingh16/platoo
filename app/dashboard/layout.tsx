"use client"

import { AuthGuard } from "@/components/auth-guard"
import { RestaurantProvider } from "@/components/restaurant-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <RestaurantProvider>{children}</RestaurantProvider>
    </AuthGuard>
  )
}
