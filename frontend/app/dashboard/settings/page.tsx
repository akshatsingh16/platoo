"use client"

import { useEffect, useState, useCallback } from "react"
import { useRestaurant } from "@/components/restaurant-context"
import { getRestaurantSettings, updateRestaurantSettings } from "@/lib/api"
import type { RestaurantResponse, RestaurantSettingsRequest } from "@/lib/types"

import { AppSidebar } from "@/components/dashboardcontent/sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Loader2, Save, Settings } from "lucide-react"

export default function SettingsPage() {
  const { restaurant } = useRestaurant()
  const [settings, setSettings] = useState<RestaurantSettingsRequest>({})
  const [restaurantData, setRestaurantData] = useState<RestaurantResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchSettings = useCallback(async () => {
    if (!restaurant) return
    try {
      setLoading(true)
      const data = await getRestaurantSettings(restaurant.id)
      setRestaurantData(data)
      setSettings({
        taxPercentage: data.taxPercentage,
        serviceCharge: data.serviceCharge,
        allowCashPayment: data.allowCashPayment,
        allowCardPayment: data.allowCardPayment,
        allowUpi: data.allowUpi,
        allowOnlinePayment: data.allowOnlinePayment,
        acceptingOrders: data.acceptingOrders,
        autoAcceptOrders: data.autoAcceptOrders,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    if (!restaurant) return
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await updateRestaurantSettings(restaurant.id, settings)
      setSuccess("Settings saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const Toggle = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string
    description: string
    checked: boolean
    onChange: (v: boolean) => void
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-orange-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-[#f7f7f6]">
          <div className="px-3 pt-2">
            <SidebarTrigger />
          </div>

          <div className="px-4 pb-6 pt-2">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Settings</h1>
                <p className="text-xs text-muted-foreground">
                  Restaurant configuration and preferences
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-1.5 rounded-lg bg-orange-500 text-xs hover:bg-orange-600"
                size="sm"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Changes
              </Button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-600">
                {success}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Restaurant info */}
                {restaurantData && (
                  <Card className="rounded-xl border bg-white p-4 shadow-none">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Settings className="h-4 w-4 text-orange-500" />
                      Restaurant Info
                    </h2>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{restaurantData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">{restaurantData.status}</span>
                      </div>
                      {restaurantData.phone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="font-medium">{restaurantData.phone}</span>
                        </div>
                      )}
                      {restaurantData.email && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-medium">{restaurantData.email}</span>
                        </div>
                      )}
                      {restaurantData.address && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Address</span>
                          <span className="text-right font-medium">
                            {restaurantData.address}
                            {restaurantData.city && `, ${restaurantData.city}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Tax & Charges */}
                <Card className="rounded-xl border bg-white p-4 shadow-none">
                  <h2 className="mb-3 text-sm font-semibold">Tax & Charges</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Tax Percentage (%)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.taxPercentage ?? 0}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxPercentage: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-8 w-32 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Service Charge (%)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.serviceCharge ?? 0}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            serviceCharge: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-8 w-32 text-xs"
                      />
                    </div>
                  </div>
                </Card>

                {/* Payment Methods */}
                <Card className="rounded-xl border bg-white p-4 shadow-none">
                  <h2 className="mb-1 text-sm font-semibold">Payment Methods</h2>
                  <div className="divide-y">
                    <Toggle
                      label="Cash"
                      description="Accept cash payments"
                      checked={settings.allowCashPayment ?? true}
                      onChange={(v) =>
                        setSettings({ ...settings, allowCashPayment: v })
                      }
                    />
                    <Toggle
                      label="Card"
                      description="Accept card payments"
                      checked={settings.allowCardPayment ?? true}
                      onChange={(v) =>
                        setSettings({ ...settings, allowCardPayment: v })
                      }
                    />
                    <Toggle
                      label="UPI"
                      description="Accept UPI payments"
                      checked={settings.allowUpi ?? false}
                      onChange={(v) => setSettings({ ...settings, allowUpi: v })}
                    />
                    <Toggle
                      label="Online"
                      description="Accept online payments"
                      checked={settings.allowOnlinePayment ?? false}
                      onChange={(v) =>
                        setSettings({ ...settings, allowOnlinePayment: v })
                      }
                    />
                  </div>
                </Card>

                {/* Order Settings */}
                <Card className="rounded-xl border bg-white p-4 shadow-none">
                  <h2 className="mb-1 text-sm font-semibold">Order Settings</h2>
                  <div className="divide-y">
                    <Toggle
                      label="Accepting Orders"
                      description="Toggle whether customers can place new orders"
                      checked={settings.acceptingOrders ?? true}
                      onChange={(v) =>
                        setSettings({ ...settings, acceptingOrders: v })
                      }
                    />
                    <Toggle
                      label="Auto-Accept Orders"
                      description="Automatically accept new orders without manual approval"
                      checked={settings.autoAcceptOrders ?? false}
                      onChange={(v) =>
                        setSettings({ ...settings, autoAcceptOrders: v })
                      }
                    />
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
