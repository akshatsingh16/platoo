"use client"

import { formatCurrency } from "@/lib/utils"
import {
  ArrowRight,
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
  cart: Record<number, number>
  cartTotal: number
  onAdd: (id: number) => void
  onRemove: (id: number) => void
}

export function CartDrawer({
  open,
  onClose,
  cartItems,
  cart,
  cartTotal,
  onAdd,
  onRemove,
}: CartDrawerProps) {

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">

      {/* Overlay */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />


      {/* Drawer */}
      <div className="
        absolute
        right-0
        top-0
        h-full
        w-full
        max-w-sm
        overflow-y-auto
        bg-white
        p-5
        shadow-xl
      ">

        {/* Header */}
        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold">
              Your Cart
            </h2>

            <p className="text-[9px] text-muted-foreground">
              Review your order
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
            "
          >
            <X className="h-4 w-4" />
          </button>

        </div>


        {/* Items */}
        <div className="mt-5 space-y-3">

          {cartItems.length === 0 ? (

            <div className="py-20 text-center">

              <ShoppingCart className="mx-auto mb-3 h-8 w-8 text-gray-300" />

              <p className="text-sm font-medium">
                Your cart is empty
              </p>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Add something delicious!
              </p>

            </div>

          ) : (

            cartItems.map((item) => {

              const quantity =
                cart[item.id] || 0

              return (
                <div
                  key={item.id}
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    pb-3
                  "
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-xs font-semibold">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[9px] text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>

                  </div>

                  <div className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-gray-100
                    px-2
                    py-1
                  ">

                    <button
                      type="button"
                      onClick={() =>
                        onRemove(item.id)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <span className="text-[9px]">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onAdd(item.id)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </button>

                  </div>

                </div>
              )
            })

          )}

        </div>


        {/* Total */}
        {cartItems.length > 0 && (

          <div className="mt-6">

            <div className="flex items-center justify-between">

              <span className="text-sm font-medium">
                Total
              </span>

              <span className="text-lg font-semibold text-[#d94b16]">
                {formatCurrency(cartTotal)}
              </span>

            </div>

            <Button
              className="
                mt-4
                h-10
                w-full
                rounded-full
                bg-[#153f38]
                text-xs
                hover:bg-[#153f38]
              "
            >

              Proceed to Checkout

              <ArrowRight className="ml-2 h-4 w-4" />

            </Button>

          </div>

        )}

      </div>

    </div>
  )
}