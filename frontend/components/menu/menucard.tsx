"use client"

import { formatCurrency } from "@/lib/utils"
import { Minus, Plus, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import type { MenuItem } from "./menudata"

type MenuCardProps = {
  item: MenuItem
  quantity: number
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

export function MenuCard({ item, quantity, onAdd, onRemove }: MenuCardProps) {
  return (
    <Card
      className={`overflow-hidden rounded-2xl border bg-white p-0 shadow-none transition hover:shadow-md ${
        item.isAvailable ? "" : "opacity-60"
      }`}
    >
      {/* IMAGE */}
      <div className="relative">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-[#dce9df]">
            <Utensils className="h-10 w-10 text-[#153f38]/40" />
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-700 shadow-sm">
          {item.category}
        </span>

        {!item.isAvailable && (
          <span className="absolute right-2 top-2 rounded-full bg-gray-900/80 px-2 py-1 text-[10px] font-medium text-white">
            Sold out
          </span>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{item.name}</h3>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>

          <span className="shrink-0 text-sm font-semibold text-[#d94b16]">
            {formatCurrency(item.price)}
          </span>
        </div>

        {/* CART */}
        <div className="mt-3 flex items-center justify-end">
          {!item.isAvailable ? (
            <span className="text-xs text-muted-foreground">Currently unavailable</span>
          ) : quantity === 0 ? (
            <Button
              type="button"
              onClick={() => onAdd(item.id)}
              className="h-8 rounded-full bg-[#153f38] px-4 text-xs hover:bg-[#1d554b]"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-[#153f38] px-2 py-1 text-white">
              <button
                type="button"
                aria-label={`Remove one ${item.name}`}
                onClick={() => onRemove(item.id)}
                className="flex h-6 w-6 items-center justify-center"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-4 text-center text-xs">{quantity}</span>
              <button
                type="button"
                aria-label={`Add one ${item.name}`}
                onClick={() => onAdd(item.id)}
                className="flex h-6 w-6 items-center justify-center"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}