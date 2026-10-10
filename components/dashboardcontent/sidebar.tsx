"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  LayoutDashboard,
  ShoppingBag,
  Table2,
  ClipboardList,
  Users,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { getUser, logout } from "@/lib/auth"

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Tables",
    url: "/dashboard/tables",
    icon: Table2,
  },
  {
    title: "Menu",
    url: "/dashboard/menu",
    icon: ClipboardList,
  },
  {
    title: "Employees",
    url: "/dashboard/employees",
    icon: Users,
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: CreditCard,
  },
]

const otherItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <Sidebar>

      {/* LOGO */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500">
            <span className="text-xs font-bold text-white">
              P
            </span>
          </div>

          <span className="text-base font-semibold">
            Plato
          </span>
        </div>
      </SidebarHeader>


      {/*SIDEBAR CONTENT*/}
      <SidebarContent>

        {/* MENU */}
        <SidebarGroup className="px-3 py-1">

          <SidebarGroupLabel
            className="mb-1 px-1 text-[11px] font-normal text-muted-foreground " >
            Menu
          </SidebarGroupLabel>

          <SidebarMenu className="gap-1">

            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>

                <SidebarMenuButton
                  isActive={
                    item.url === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.url)
                  }
                  className="h-8 w-full rounded-md px-2 text-xs font-normal [&>svg]:size-4 [&>svg]:shrink-0"
                  render={
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  }
                />

              </SidebarMenuItem>
            ))}

          </SidebarMenu>

        </SidebarGroup>


        {/*  DIVIDER  */}
        <div className="mx-4 my-3 border-t" />


        {/* OTHERS */}
        <SidebarGroup className="px-3 py-0">

          <SidebarGroupLabel
            className="mb-1 px-1 text-[11px] font-normal text-muted-foreground">
            Others
          </SidebarGroupLabel>

          <SidebarMenu className="gap-1">

            {otherItems.map((item) => (
              <SidebarMenuItem key={item.title}>

                <SidebarMenuButton
                  isActive={pathname.startsWith(item.url)}
                  className="h-8 w-full rounded-md px-2 text-xs  font-normal [&>svg]:size-4
                    [&>svg]:shrink-0 "
                  render={
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  }
                />

              </SidebarMenuItem>
            ))}

            {/* Logout */}
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-8 w-full rounded-md px-2 text-xs font-normal text-red-500 hover:bg-red-50 hover:text-red-600 [&>svg]:size-4 [&>svg]:shrink-0"
                onClick={handleLogout}
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>

        </SidebarGroup>

      </SidebarContent>


      {/* USER FOOTER */}
      <SidebarFooter className="px-3 pb-4">

        <div className="flex items-center gap-2 px-2 py-2">

          {/* Avatar */}
          <div
            className="flex h-8 w-8 shrink-0 items-center  justify-center  rounded-full  bg-orange-100  text-xs  font-medium  text-orange-700">
            {initials}
          </div>

          {/* User */}
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium">
              {user?.fullName || "User"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {user?.role || "—"}
            </span>
          </div>
        </div>
      </SidebarFooter>

    </Sidebar>
  )
}