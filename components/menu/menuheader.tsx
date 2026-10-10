import {
    ShoppingCart,
} from "lucide-react"

import { Button } from "@/components/ui/button"

type MenuHeaderProps = {
  cartCount: number
  onCartClick: () => void
}

export function MenuHeader({
  cartCount,
  onCartClick,
}: MenuHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">

      <div>

        <h1 className="text-xl font-semibold">
          Order Menu
        </h1>

        <p className="text-[9px] text-muted-foreground">
          Browse and reorder from any of our kitchens.
        </p>

      </div>

      <Button
        onClick={onCartClick}
        className="
          h-9
          rounded-full
          bg-[#d94b16]
          px-5
          text-[9px]
          text-white
          hover:bg-[#c44313]
        "
      >

        <ShoppingCart className="mr-1 h-3.5 w-3.5" />

        View Cart ({cartCount})

      </Button>

    </div>
  )
}


