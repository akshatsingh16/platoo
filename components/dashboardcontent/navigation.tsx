"use client"

import Link from "next/link"

import {
  Bell,
  Settings,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

import { getUser } from "@/lib/auth"
import { useRestaurant } from "@/components/restaurant-context"

export function DashboardHeader(){
    const user = getUser()
    const { restaurant } = useRestaurant()

    const initials = user?.fullName
      ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "??"

    return(
        <header className="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
            {/*-Left-*/}
            <div className="flex flex-col">
                <h1 className="text-sm font-semibold leading-tight">Dashboard</h1>
                <p className="text-[9px] text-muted-foreground">
                  {restaurant ? restaurant.name : "Welcome back :)"}
                </p>
            </div>

            <div className="flex items-center gap-2">
         {/* Notification */}

        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full"
        >
          <Bell className="h-4 w-4" />

          {/* Notification badge */}
          <span
            className="
              absolute
              right-1
              top-1
              flex
              h-2.5
              w-2.5
              items-center
              justify-center
              rounded-full
              bg-orange-500
            "
          />
        </Button>


        {/* Settings */}

        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </Link>


        {/* User */}

        <div className="ml-1 flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-orange-100 text-[9px] text-orange-700">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-[10px] font-medium">
              {user?.fullName || "User"}
            </span>
            <span className="text-[8px] text-muted-foreground">
              {user?.role || "—"}
            </span>

          </div>

        </div>

      </div>

    </header>
    )
}