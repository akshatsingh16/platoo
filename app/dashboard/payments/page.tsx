"use client"

import { formatCurrency } from "@/lib/utils"
import { useEffect, useState, useCallback } from "react"
import { useRestaurant } from "@/components/restaurant-context"
import { getRestaurantPayments, completePayment } from "@/lib/api"
import type { PaymentResponse, PaymentStatus } from "@/lib/types"

import { AppSidebar } from "@/components/dashboardcontent/sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Loader2, CreditCard, CheckCircle } from "lucide-react"

const ALL_STATUSES: PaymentStatus[] = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"]

const statusColors: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-600",
  REFUNDED: "bg-gray-100 text-gray-600",
}

export default function PaymentsPage() {
  const { restaurant } = useRestaurant()
  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<PaymentStatus | "ALL">("ALL")
  const [completing, setCompleting] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    if (!restaurant) return
    try {
      setLoading(true)
      const data = await getRestaurantPayments(
        restaurant.id,
        filter === "ALL" ? undefined : filter,
      )
      setPayments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }, [restaurant, filter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleComplete = async (paymentId: string) => {
    if (!restaurant) return
    setCompleting(paymentId)
    try {
      await completePayment(restaurant.id, paymentId)
      await fetchPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete payment")
    } finally {
      setCompleting(null)
    }
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
              <h1 className="text-lg font-semibold">Payments</h1>
              <p className="text-xs text-muted-foreground">
                Track and manage billing payments
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

            {/* Payments list */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : payments.length === 0 ? (
              <Card className="flex flex-col items-center gap-2 rounded-xl border bg-white p-8 shadow-none">
                <CreditCard className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-muted-foreground">No payments found</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <Card
                    key={payment.id}
                    className="rounded-xl border bg-white p-4 shadow-none"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            Table {payment.tableNumber}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${statusColors[payment.status]}`}
                          >
                            {payment.status}
                          </span>
                          <span className="rounded-full border px-2 py-0.5 text-[9px] text-muted-foreground">
                            {payment.paymentMethod}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-3 grid grid-cols-4 gap-2 rounded-md bg-gray-50 px-3 py-2 text-[10px]">
                      <div>
                        <p className="text-muted-foreground">Subtotal</p>
                        <p className="font-medium">{formatCurrency(payment.subtotal)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tax</p>
                        <p className="font-medium">{formatCurrency(payment.tax)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Service</p>
                        <p className="font-medium">
                          {formatCurrency(payment.serviceCharge)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Discount</p>
                        <p className="font-medium">{formatCurrency(payment.discount)}</p>
                      </div>
                    </div>

                    {payment.transactionReference && (
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        Ref: {payment.transactionReference}
                      </p>
                    )}

                    {/* Complete action */}
                    {payment.status === "PENDING" && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          onClick={() => handleComplete(payment.id)}
                          disabled={completing === payment.id}
                          size="sm"
                          className="h-7 gap-1 rounded-md bg-green-500 text-[10px] hover:bg-green-600"
                        >
                          {completing === payment.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Complete Payment
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
