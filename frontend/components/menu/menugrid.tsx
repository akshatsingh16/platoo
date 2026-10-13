import { Utensils } from "lucide-react"

import { Card } from "@/components/ui/card"

import { MenuCard } from "./menucard"
import type { MenuItem } from "./menudata"

type MenuGridProps = {
  items: MenuItem[]
  cart: Record<string, number>
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

export function MenuGrid({ items, cart, onAdd, onRemove }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <Card className="rounded-2xl border bg-white p-10 text-center">
        <Utensils className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        <h3 className="text-sm font-semibold">No dishes found</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Try another search or category.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          quantity={cart[item.id] || 0}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}