"use client"

import { formatCurrency } from "@/lib/utils"
import { useEffect, useState, useCallback } from "react"
import { useRestaurant } from "@/components/restaurant-context"
import { getRestaurantOrders, updateOrderStatus } from "@/lib/api"
import type { OrderResponse, OrderStatus } from "@/lib/types"

import { AppSidebar } from "@/components/dashboardcontent/sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Loader2, ShoppingBag, ChevronRight } from "lucide-react"

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "SERVED",
  "CANCELLED",
]

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ACCEPTED: "bg-blue-100 text-blue-700 border-blue-200",
  PREPARING: "bg-purple-100 text-purple-700 border-purple-200",
  READY: "bg-green-100 text-green-700 border-green-200",
  SERVED: "bg-gray-100 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-100 text-red-600 border-red-200",
}

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
}

export default function OrdersPage() {
  const { restaurant } = useRestaurant()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL")
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!restaurant) return
    try {
      setLoading(true)
      const data = await getRestaurantOrders(
        restaurant.id,
        filter === "ALL" ? undefined : filter,
      )
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [restaurant, filter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      setUpdating(orderId)
      await updateOrderStatus(orderId, status)
      await fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setUpdating(null)
    }
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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
            <div className="mb-4">
              <h1 className="text-lg font-semibold">Orders</h1>
              <p className="text-xs text-muted-foreground">
                Manage and track restaurant orders
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
                <button onClick={() => setError("")} className="ml-2 font-bold">
                  ×
                </button>
              </div>
            )}

            {/* Status filters */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              <Button
                variant={filter === "ALL" ? "default" : "outline"}
                size="sm"
                className={`h-7 rounded-full text-[10px] ${filter === "ALL" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                onClick={() => setFilter("ALL")}
              >
                All
              </Button>
              {ALL_STATUSES.map((s) => (
                <Button
                  key={s}
                  variant={filter === s ? "default" : "outline"}
                  size="sm"
                  className={`h-7 rounded-full text-[10px] ${filter === s ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                  onClick={() => setFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>

            {/* Refresh */}
            <div className="mb-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px]"
                onClick={fetchOrders}
              >
                Refresh
              </Button>
            </div>

            {/* Orders */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="flex flex-col items-center gap-2 rounded-xl border bg-white p-8 shadow-none">
                <ShoppingBag className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-muted-foreground">No orders found</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className="rounded-xl border bg-white p-4 shadow-none"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            #{order.orderNumber}
                          </h3>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${statusColors[order.status]}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Table {order.tableNumber} · {formatTime(order.placedAt)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(order.grandTotal)}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="mt-3 space-y-1.5">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">
                            {item.quantity}× {item.menuItemName}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="mt-2 rounded bg-yellow-50 px-2 py-1 text-[10px] italic text-yellow-700">
                        Note: {order.notes}
                      </p>
                    )}

                    {/* Action: advance to next status */}
                    {nextStatus[order.status] && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          onClick={() =>
                            handleStatusUpdate(
                              order.id,
                              nextStatus[order.status]!,
                            )
                          }
                          disabled={updating === order.id}
                          size="sm"
                          className="h-7 gap-1 rounded-md bg-orange-500 text-[10px] hover:bg-orange-600"
                        >
                          {updating === order.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              Move to {nextStatus[order.status]}
                              <ChevronRight className="h-3 w-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
