"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Receipt,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { OrderResponse, BillSummaryResponse, PaymentMethod } from "@/lib/types"

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Sent to Kitchen", color: "bg-amber-100 text-amber-800" },
  ACCEPTED: { label: "Accepted", color: "bg-blue-100 text-blue-800" },
  PREPARING: { label: "Cooking in Kitchen", color: "bg-orange-100 text-orange-800" },
  READY: { label: "Ready to Serve", color: "bg-purple-100 text-purple-800" },
  SERVED: { label: "Served", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
}

type OrdersDrawerProps = {
  open: boolean
  onClose: () => void
  orders: OrderResponse[]
  billSummary: BillSummaryResponse | null
  onRequestBill: (method: PaymentMethod) => Promise<void>
  requestingBill?: boolean
  billRequested?: boolean
}

export function OrdersDrawer({
  open,
  onClose,
  orders,
  billSummary,
  onRequestBill,
  requestingBill = false,
  billRequested = false,
}: OrdersDrawerProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close orders"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-orange-500" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Table Orders & Bill</h2>
              <p className="text-xs text-muted-foreground">
                {orders.length} {orders.length === 1 ? "order" : "orders"} placed
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-5">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-sm">No orders placed for this table yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusMeta = statusLabels[order.status] || {
                  label: order.status,
                  color: "bg-gray-100 text-gray-800",
                }

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-800">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="space-y-1.5 border-t border-gray-100 pt-2 text-xs">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-gray-700">
                          <span>
                            {item.quantity}× {item.menuItemName}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="mt-2 text-[10px] italic text-muted-foreground">
                        Note: {order.notes}
                      </p>
                    )}

                    <div className="mt-2 flex justify-between border-t border-gray-200/60 pt-2 text-xs font-semibold">
                      <span>Order Total</span>
                      <span className="text-[#d94b16]">{formatCurrency(order.grandTotal)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bill summary & Request bill */}
        {billSummary && orders.length > 0 && (
          <div className="border-t bg-gray-50/90 p-5">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatCurrency(billSummary.ordersSubtotal)}</span>
              </div>
              {billSummary.taxTotal > 0 && (
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>{formatCurrency(billSummary.taxTotal)}</span>
                </div>
              )}
              {billSummary.serviceChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge ({billSummary.serviceChargePercentage}%)</span>
                  <span>{formatCurrency(billSummary.serviceChargeAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-sm font-bold text-gray-900">
                <span>Grand Total</span>
                <span className="text-base text-[#d94b16]">
                  {formatCurrency(billSummary.grandTotal)}
                </span>
              </div>
            </div>

            {billRequested ? (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Bill requested! Staff has been notified.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  {(["UPI", "CASH", "CARD"] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`flex-1 rounded-lg border py-1.5 text-[11px] font-semibold transition ${
                        selectedMethod === method
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  disabled={requestingBill}
                  onClick={() => onRequestBill(selectedMethod)}
                  className="h-10 w-full rounded-xl bg-gray-900 text-xs font-bold text-white hover:bg-black"
                >
                  {requestingBill ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Requesting Bill...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Request Bill ({selectedMethod})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
