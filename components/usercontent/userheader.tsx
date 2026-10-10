"use client"

import {
  Search,
  ShoppingBasket,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"


export function UserHeader() {
  return (
    <header
      className="
        flex
        h-14
        items-center
        justify-between
        rounded-xl
        border
        bg-white
        px-5
      "
    >

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <nav className="hidden items-center gap-7 md:flex">

        <a
          href="/"
          className="text-xs font-medium text-gray-700 hover:text-[#d94b16]"
        >
          Home
        </a>

        <a
          href="/menu"
          className="text-xs font-medium text-gray-700 hover:text-[#d94b16]"
        >
          Menu
        </a>

        <a
          href="/about"
          className="text-xs font-medium text-gray-700 hover:text-[#d94b16]"
        >
          About
        </a>

        <a
          href="/locations"
          className="text-xs font-medium text-gray-700 hover:text-[#d94b16]"
        >
          Locations
        </a>

      </nav>


      {/* =====================================================
          RIGHT ACTIONS
          ===================================================== */}

      <div className="ml-auto flex items-center gap-2">

        {/* Search */}

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
        >
          <Search className="h-4 w-4" />
        </Button>


        {/* Cart */}

        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >

          <ShoppingBasket className="h-4 w-4" />

          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-4
              w-4
              items-center
              justify-center
              rounded-full
              bg-[#d94b16]
              text-[8px]
              font-semibold
              text-white
            "
          >
            3
          </span>

        </Button>


        {/* User */}

        <Button
          size="icon"
          className="
            h-9
            w-9
            rounded-full
            bg-[#173b35]
            text-white
            hover:bg-[#173b35]
          "
        >
          <UserRound className="h-4 w-4" />
        </Button>

      </div>

    </header>
  )
}