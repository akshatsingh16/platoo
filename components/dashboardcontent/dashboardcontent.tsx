"use client"

import { formatCurrency } from "@/lib/utils"
import { useEffect, useState, useCallback } from "react"
import { useRestaurant } from "@/components/restaurant-context"
import { getRestaurantOrders, getTables } from "@/lib/api"
import type { OrderResponse, TableResponse } from "@/lib/types"

import type { LucideIcon } from "lucide-react"

import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  ShoppingBag,
  Users,
  Utensils,
  Loader2,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"


// STAT CARD

type StatCardProps = {
  title: string
  value: string
  total: string
  percentage: number
  icon: LucideIcon
}

function StatCard({
  title,
  value,
  total,
  percentage,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="rounded-xl border bg-white p-3 shadow-none">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div className="flex items-center gap-1.5">

          <Icon className="h-3.5 w-3.5 text-orange-500" />

          <span className="text-[10px] font-medium text-muted-foreground">
            {title}
          </span>

        </div>

        <span className="text-xl font-semibold leading-none">
          {value}
        </span>

      </div>


      {/* Progress information */}
      <div className="mt-3">

        <div className="mb-1 flex items-center justify-between">

          <span className="text-[8px] text-muted-foreground">
            Total {total}
          </span>

          <span className="text-[9px] font-medium">
            {percentage}%
          </span>

        </div>


        {/* Progress bar */}
        <div className="h-5 overflow-hidden rounded-md bg-gray-100">

          <div
            className="h-full rounded-md bg-orange-400"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

    </Card>
  )
}


// ============================================================
// STORE CARD
// ============================================================

type StoreCardProps = {
  name: string
  location: string
  status: "Open" | "Closed"
  image: string
}

function StoreCard({
  name,
  location,
  status,
  image,
}: StoreCardProps) {
  return (
    <div className="relative h-[58px] overflow-hidden rounded-lg">

      <img
        src={image}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />


      {/* Store information */}
      <div className="absolute inset-x-2 bottom-1.5 flex items-end justify-between gap-2">

        <div className="min-w-0 text-white">

          <p className="truncate text-[9px] font-medium">
            {name}
          </p>

          <p className="text-[7px] opacity-90">
            ♟ {location}
          </p>

        </div>


        {/* Status */}
        <span
          className={
            status === "Open"
              ? "shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[6px] font-medium text-green-700"
              : "shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[6px] font-medium text-red-600"
          }
        >
          ● {status}
        </span>

      </div>

    </div>
  )
}


// ============================================================
// STORES (uses real restaurant data)
// ============================================================

function Stores({ restaurants }: { restaurants: { name: string; city: string | null; status: string }[] }) {
  return (
    <Card className="rounded-xl border bg-white p-3 shadow-none">

      {/* Header */}
      <div className="mb-2 flex items-center justify-between">

        <h2 className="text-sm font-semibold">
          Stores
        </h2>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
        >
          <ArrowUpRight className="h-3 w-3" />
        </Button>

      </div>


      {/* Store list */}
      <div className="space-y-2">
        {restaurants.length > 0 ? restaurants.slice(0, 3).map((r, i) => (
          <StoreCard
            key={i}
            name={r.name}
            location={r.city || "—"}
            status={r.status === "ACTIVE" ? "Open" : "Closed"}
            image={`https://images.unsplash.com/photo-${["1517248135467-4c7edcad34c4", "1552566626-52f8b828add9", "1515003197210-e0cd71810b5f"][i % 3]}?auto=format&fit=crop&w=500&q=80`}
          />
        )) : (
          <p className="py-4 text-center text-xs text-muted-foreground">No restaurants yet</p>
        )}
      </div>

    </Card>
  )
}


// ============================================================
// REVENUE CHART
// ============================================================

function RevenueChart() {
  const data = [
    { day: "Sun", value: 20 },
    { day: "Mon", value: 48 },
    { day: "Tue", value: 35 },
    { day: "Wed", value: 25 },
    { day: "Thu", value: 62 },
    { day: "Fri", value: 55 },
    { day: "Sat", value: 30 },
  ]

  return (
    <Card className="rounded-xl border bg-white p-4 shadow-none">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-sm font-semibold">
            Total Revenue
          </h2>

          <p className="text-[8px] text-muted-foreground">
            Sales Overview
          </p>

        </div>


        {/* Filters */}
        <div className="flex items-center gap-1">

          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-full px-2 text-[8px]"
          >
            <CalendarDays className="mr-1 h-3 w-3" />
            This Month
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
          >
            <ArrowUpRight className="h-3 w-3" />
          </Button>

        </div>

      </div>


      {/* Chart */}
      <div className="relative mt-5 h-[180px]">

        {/* Grid */}
        <div className="absolute inset-0 flex flex-col justify-between">

          <div className="border-t border-dashed" />
          <div className="border-t border-dashed" />
          <div className="border-t border-dashed" />
          <div className="border-t border-dashed" />
          <div className="border-t border-dashed" />

        </div>


        {/* Y axis */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between">

          <span className="text-[7px] text-muted-foreground">1k</span>
          <span className="text-[7px] text-muted-foreground">800</span>
          <span className="text-[7px] text-muted-foreground">600</span>
          <span className="text-[7px] text-muted-foreground">400</span>
          <span className="text-[7px] text-muted-foreground">200</span>
          <span className="text-[7px] text-muted-foreground">0</span>

        </div>


        {/* Bars */}
        <div className="absolute bottom-0 left-8 right-0 flex h-full items-end justify-between gap-3">

          {data.map((item) => (
            <div
              key={item.day}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >

              <div
                className={
                  item.day === "Thu"
                    ? "w-full max-w-[34px] rounded-t-md bg-orange-500"
                    : "w-full max-w-[34px] rounded-t-md bg-gray-100"
                }
                style={{
                  height: `${item.value * 2.2}px`,
                }}
              />

              <span className="mt-2 text-[7px] text-muted-foreground">
                {item.day}
              </span>

            </div>
          ))}

        </div>

      </div>

    </Card>
  )
}


// ============================================================
// BUSINESS DATA
// ============================================================

function BusinessData({ orderCount, tableCount }: { orderCount: number; tableCount: number }) {
  return (
    <Card className="rounded-xl border bg-white p-4 shadow-none">

      {/* Header */}
      <div className="flex items-center justify-between">

        <h2 className="text-sm font-semibold">
          Business Data
        </h2>

        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-full px-2 text-[8px]"
        >
          <CalendarDays className="mr-1 h-3 w-3" />
          This Week
        </Button>

      </div>


      {/* Customers */}
      <div className="mt-3 rounded-lg bg-indigo-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[8px] text-muted-foreground">Available Tables</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Utensils className="h-4 w-4" />
          <span className="text-lg font-semibold">{tableCount}</span>
        </div>
      </div>


      {/* Orders */}
      <div className="mt-2 rounded-lg bg-orange-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[8px] text-muted-foreground">Total Orders</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
        <div className="mt-1 flex items-center gap-1">
          <ClipboardList className="h-4 w-4" />
          <span className="text-lg font-semibold">{orderCount}</span>
        </div>
      </div>

    </Card>
  )
}


// ============================================================
// RECENT ACTIVITY (uses real orders)
// ============================================================

function RecentActivity({ orders }: { orders: OrderResponse[] }) {
  return (
    <Card className="rounded-xl border bg-white p-4 shadow-none">

      {/* Header */}
      <div className="mb-2 flex items-center justify-between">

        <h2 className="text-sm font-semibold">
          Recent Orders
        </h2>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-full"
        >
          <ArrowUpRight className="h-3 w-3" />
        </Button>

      </div>


      {/* Activity list */}
      <div>

        {orders.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No recent orders</p>
        ) : orders.slice(0, 5).map((order) => (
          <div
            key={order.id}
            className="flex items-center gap-2 border-b py-2.5 last:border-b-0"
          >

            {/* Icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <ShoppingBag className="h-3.5 w-3.5 text-orange-600" />
            </div>


            {/* Information */}
            <div className="min-w-0 flex-1">

              <p className="text-[10px] font-medium">
                Order #{order.orderNumber}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">

                <span className="text-[8px] text-muted-foreground">
                  {formatCurrency(order.grandTotal)}
                </span>

                <span className="text-[8px] text-muted-foreground">
                  Table {order.tableNumber}
                </span>

                <span className="text-[8px] text-muted-foreground">
                  {order.items.length} items
                </span>

              </div>

            </div>


            {/* Status */}
            <span
              className={
                order.status === "SERVED"
                  ? "shrink-0 rounded-full bg-green-100 px-2 py-1 text-[7px] font-medium text-green-700"
                  : order.status === "CANCELLED"
                  ? "shrink-0 rounded-full bg-red-100 px-2 py-1 text-[7px] font-medium text-red-600"
                  : "shrink-0 rounded-full bg-orange-100 px-2 py-1 text-[7px] font-medium text-orange-600"
              }
            >
              {order.status}
            </span>

          </div>
        ))}

      </div>

    </Card>
  )
}


// ============================================================
// MAIN DASHBOARD CONTENT
// ============================================================

export function DashboardContent() {
  const { restaurant, restaurants, loading: restaurantLoading } = useRestaurant()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [tables, setTables] = useState<TableResponse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (restaurantLoading) return
    if (!restaurant) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [ordersData, tablesData] = await Promise.all([
        getRestaurantOrders(restaurant.id).catch(() => []),
        getTables(restaurant.id).catch(() => []),
      ])
      setOrders(ordersData)
      setTables(tablesData)
    } finally {
      setLoading(false)
    }
  }, [restaurant, restaurantLoading])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const pendingOrders = orders.filter((o) => o.status === "PENDING")
  const inProgressOrders = orders.filter((o) =>
    ["ACCEPTED", "PREPARING"].includes(o.status),
  )
  const availableTables = tables.filter((t) => t.status === "AVAILABLE")

  if (loading || restaurantLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <Card className="flex flex-col items-center gap-3 rounded-xl border bg-white p-10 shadow-none">
        <Utensils className="h-12 w-12 text-gray-300" />
        <h2 className="text-sm font-semibold text-gray-700">No Restaurant Yet</h2>
        <p className="text-center text-xs text-muted-foreground">
          Create your first restaurant to start managing tables, menu, orders, and more.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">

      {/* ======================================================
          TOP STATISTICS
          ====================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Pending Orders"
          value={String(pendingOrders.length).padStart(2, "0")}
          total={String(orders.length)}
          percentage={orders.length > 0 ? Math.round((pendingOrders.length / orders.length) * 100) : 0}
          icon={ClipboardList}
        />

        <StatCard
          title="Orders in Progress"
          value={String(inProgressOrders.length).padStart(2, "0")}
          total={String(orders.length)}
          percentage={orders.length > 0 ? Math.round((inProgressOrders.length / orders.length) * 100) : 0}
          icon={ShoppingBag}
        />

        <StatCard
          title="Available Tables"
          value={String(availableTables.length).padStart(2, "0")}
          total={String(tables.length)}
          percentage={tables.length > 0 ? Math.round((availableTables.length / tables.length) * 100) : 0}
          icon={Utensils}
        />

        <Stores restaurants={restaurants.map(r => ({ name: r.name, city: r.city, status: r.status }))} />

      </div>


      {/* ======================================================
          REVENUE + BUSINESS DATA
          ====================================================== */}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.7fr_1fr]">

        <RevenueChart />

        <BusinessData orderCount={orders.length} tableCount={availableTables.length} />

      </div>


      {/* RECENT ACTIVITY */}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

        <RecentActivity orders={orders} />

      </div>

    </div>
  )
}