"use client"

import { useState } from "react"
import Link from "next/link"

import {
  Bell,
  Building2,
  ChevronDown,
  Loader2,
  Plus,
  Settings,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { getUser } from "@/lib/auth"
import { useRestaurant } from "@/components/restaurant-context"
import { createRestaurant } from "@/lib/api"
import type { CreateRestaurantRequest } from "@/lib/types"

export function DashboardHeader() {
  const user = getUser()
  const { restaurant, restaurants, selectRestaurant, refresh } = useRestaurant()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<CreateRestaurantRequest>({
    name: "",
    city: "",
    phone: "",
    taxPercentage: 5,
  })

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  const handleCreateRestaurant = async () => {
    if (!form.name.trim()) return
    setCreating(true)
    setError("")
    try {
      const created = await createRestaurant(form)
      await refresh()
      selectRestaurant(created)
      setShowCreateModal(false)
      setForm({ name: "", city: "", phone: "", taxPercentage: 5 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create restaurant")
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <header className="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
        {/* Left: Title & Restaurant Selector */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold leading-tight">Dashboard</h1>
            <p className="text-[10px] text-muted-foreground">
              {restaurant ? restaurant.name : "No restaurant selected"}
            </p>
          </div>

          {/* Restaurant switcher */}
          {restaurants.length > 0 && (
            <div className="relative ml-2 hidden sm:block">
              <select
                aria-label="Select restaurant"
                value={restaurant?.id || ""}
                onChange={(e) => {
                  const found = restaurants.find((r) => r.id === e.target.value)
                  if (found) selectRestaurant(found)
                }}
                className="h-8 appearance-none rounded-lg border bg-gray-50 py-0 pl-3 pr-7 text-xs font-medium text-gray-700 outline-none hover:bg-gray-100"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
            </div>
          )}

          {/* New Restaurant Button (Owner / Super Admin) */}
          {(user?.role === "OWNER" || user?.role === "SUPER_ADMIN") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="h-7 gap-1 rounded-lg border-dashed px-2 text-[11px] text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-orange-500" />
          </Button>

          {/* Settings */}
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          {/* User info */}
          <div className="ml-1 flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-orange-100 text-[9px] font-bold text-orange-700">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-[10px] font-semibold">{user?.fullName || "User"}</span>
              <span className="text-[8px] text-muted-foreground">{user?.role || "—"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Create Restaurant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setShowCreateModal(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                <h2 className="text-base font-bold text-gray-900">Create Restaurant</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Restaurant Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bella Italia Bistro"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">City</label>
                <Input
                  value={form.city || ""}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. New Delhi"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
                <Input
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Tax Percentage (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.taxPercentage || 5}
                  onChange={(e) =>
                    setForm({ ...form, taxPercentage: parseFloat(e.target.value) || 0 })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                disabled={creating || !form.name.trim()}
                onClick={handleCreateRestaurant}
                className="flex-1 rounded-xl bg-orange-500 text-xs font-bold text-white hover:bg-orange-600"
              >
                {creating ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                Create Restaurant
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}