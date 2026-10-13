"use client"

import { Receipt, ShoppingCart, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"

type MenuHeaderProps = {
  restaurantName?: string
  tableNumber?: string
  cartCount: number
  activeOrdersCount?: number
  onCartClick: () => void
  onOrdersClick?: () => void
}

export function MenuHeader({
  restaurantName = "Plato Dining",
  tableNumber,
  cartCount,
  activeOrdersCount = 0,
  onCartClick,
  onOrdersClick,
}: MenuHeaderProps) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 font-bold text-white shadow-md shadow-orange-300/40">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900">{restaurantName}</h1>
            {tableNumber && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                Table {tableNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Order dishes directly to your table</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onOrdersClick && activeOrdersCount > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={onOrdersClick}
            className="h-9 gap-1.5 rounded-full border-orange-200 text-xs font-semibold text-orange-700 hover:bg-orange-50"
          >
            <Receipt className="h-3.5 w-3.5" />
            Orders ({activeOrdersCount})
          </Button>
        )}

        <Button
          type="button"
          onClick={onCartClick}
          className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-xs font-bold text-white shadow-md shadow-orange-300/30 hover:from-orange-600 hover:to-amber-600"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Cart ({cartCount})
        </Button>
      </div>
    </header>
  )
}
