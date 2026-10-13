"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { MenuItem } from "./menudata"

type CartDrawerProps = {
  open: boolean
  onClose: () => void
  cartItems: MenuItem[]
  cart: Record<string, number>
  cartTotal: number
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onPlaceOrder: (notes?: string) => Promise<void>
  placingOrder?: boolean
  error?: string | null
}

export function CartDrawer({
  open,
  onClose,
  cartItems,
  cart,
  cartTotal,
  onAdd,
  onRemove,
  onPlaceOrder,
  placingOrder = false,
  error = null,
}: CartDrawerProps) {
  const [notes, setNotes] = useState("")

  if (!open) {
    return null
  }

  const handleCheckout = async () => {
    await onPlaceOrder(notes.trim() || undefined)
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Your Order</h2>
            <p className="text-xs text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? "dish" : "dishes"} selected
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-800">Your cart is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add delicious items from the menu to start your order!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const quantity = cart[item.id] || 0
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5 shadow-sm"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-100 font-bold text-orange-600">
                        {item.name[0]}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs font-medium text-[#d94b16]">
                        {formatCurrency(item.price * quantity)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => onRemove(item.id)}
                        className="flex h-5 w-5 items-center justify-center text-gray-700 hover:text-black"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="min-w-3 text-center text-xs font-semibold">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => onAdd(item.id)}
                        className="flex h-5 w-5 items-center justify-center text-gray-700 hover:text-black"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Special Instructions / Notes */}
              <div className="pt-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Kitchen Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Less spicy, dressing on the side..."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t bg-gray-50/70 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Subtotal</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <Button
              type="button"
              disabled={placingOrder}
              onClick={handleCheckout}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-xs font-bold text-white shadow-lg shadow-orange-300/40 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Order to Kitchen...
                </>
              ) : (
                <>
                  Place Order ({formatCurrency(cartTotal)})
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}