"use client"

import { formatCurrency } from "@/lib/utils"
import {
  Clock3,
  Heart,
  Minus,
  Plus,
  Star,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import type { MenuItem } from "./menudata"

type MenuCardProps = {
  item: MenuItem
  isFavorite: boolean
  quantity: number
  onToggleFavorite: (id: number) => void
  onAdd: (id: number) => void
  onRemove: (id: number) => void
}

export function MenuCard({
  item,
  isFavorite,
  quantity,
  onToggleFavorite,
  onAdd,
  onRemove,
}: MenuCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border bg-white p-0 shadow-none">

      {/* ==================================================
          IMAGE
          ================================================== */}

      <div className="relative">

        <img
          src={item.image}
          alt={item.name}
          className="h-48 w-full object-cover"
        />

        {/* Chef's Pick */}
        {item.popular && (
          <span className="
            absolute
            left-2
            top-2
            rounded-full
            bg-[#153f38]
            px-2
            py-1
            text-[7px]
            font-medium
            text-white
          ">
            Chef's Pick
          </span>
        )}

        {/* Favorite */}
        <button
          type="button"
          onClick={() =>
            onToggleFavorite(item.id)
          }
          className="
            absolute
            right-2
            top-2
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-white
            shadow-sm
            transition
            hover:scale-105
          "
        >

          <Heart
            className={`
              h-4
              w-4
              transition
              ${
                isFavorite
                  ? "fill-[#d94b16] text-[#d94b16]"
                  : "text-gray-500"
              }
            `}
          />

        </button>

        {/* Veg / Non Veg */}
        <div className="
          absolute
          bottom-2
          left-2
          flex
          items-center
          gap-1
          rounded-full
          bg-white
          px-2
          py-1
          text-[7px]
          shadow-sm
        ">

          <span
            className={`
              h-2
              w-2
              rounded-full
              ${
                item.isVeg
                  ? "bg-green-600"
                  : "bg-red-600"
              }
            `}
          />

          {item.isVeg
            ? "Veg"
            : "Non Veg"}

        </div>

      </div>


      {/* ==================================================
          DETAILS
          ================================================== */}

      <div className="p-3">

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0">

            <h3 className="truncate text-sm font-semibold">
              {item.name}
            </h3>

            <p className="mt-1 line-clamp-1 text-[8px] text-muted-foreground">
              {item.description}
            </p>

          </div>

          <span className="shrink-0 text-sm font-semibold text-[#d94b16]">
            {formatCurrency(item.price)}
          </span>

        </div>


        {/* ==================================================
            TIME + RATING
            ================================================== */}

        <div className="mt-3 flex items-center gap-4">

          <div className="flex items-center gap-1 text-[8px] text-gray-500">

            <Clock3 className="h-3 w-3" />

            {item.time} min

          </div>

          <div className="flex items-center gap-1 text-[8px] text-gray-500">

            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />

            {item.rating}

          </div>

        </div>


        {/* ==================================================
            CART
            ================================================== */}

        <div className="mt-3 flex items-center justify-between">

          <span className="text-[8px] text-muted-foreground">
            Ready in {item.time} min
          </span>

          {quantity === 0 ? (

            <Button
              type="button"
              onClick={() =>
                onAdd(item.id)
              }
              className="
                h-7
                rounded-full
                bg-[#153f38]
                px-4
                text-[8px]
                hover:bg-[#153f38]
              "
            >

              <Plus className="mr-1 h-3 w-3" />

              Add

            </Button>

          ) : (

            <div className="
              flex
              items-center
              gap-2
              rounded-full
              bg-[#153f38]
              px-2
              py-1
              text-white
            ">

              <button
                type="button"
                onClick={() =>
                  onRemove(item.id)
                }
                className="flex h-5 w-5 items-center justify-center"
              >
                <Minus className="h-3 w-3" />
              </button>

              <span className="min-w-3 text-center text-[9px]">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  onAdd(item.id)
                }
                className="flex h-5 w-5 items-center justify-center"
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