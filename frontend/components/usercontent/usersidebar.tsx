"use client"

import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Bell,
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

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Order Menu",
    url: "/menu",
    icon: ClipboardList,
  },
  {
    title: "My Orders",
    url: "/orders",
    icon: ShoppingBag,
    badge: "12",
  },
  {
    title: "Favorites",
    url: "/favorites",
    icon: Heart,
    badge: "7",
  },
  {
    title: "Addresses",
    url: "/addresses",
    icon: MapPin,
  },
  {
    title: "Payment Methods",
    url: "/payment-methods",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    badge: "3",
  },
]

export function AppSidebar() {
  return (
    <Sidebar>

      {/* =====================================================
          SIDEBAR HEADER
          ===================================================== */}

      <SidebarHeader className="px-3 py-4">

        <SidebarMenu>

          <SidebarMenuItem>

            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent"
            >

              {/* Logo */}
              <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                <span className="text-lg font-bold">
                  P
                </span>
              </div>

              {/* Brand */}
              <span className="truncate text-xl font-bold text-slate-900 group-data-[collapsible=icon]:hidden">
                Plato
              </span>

            </SidebarMenuButton>

          </SidebarMenuItem>

        </SidebarMenu>

      </SidebarHeader>


      {/* =====================================================
          SIDEBAR CONTENT
          ===================================================== */}

      <SidebarContent>

        <SidebarGroup>

          <SidebarGroupLabel className="px-2 text-xs">
            Menu
          </SidebarGroupLabel>

          <SidebarMenu>

            {menuItems.map((item) => {

              const Icon = item.icon

              return (
                <SidebarMenuItem
                  key={item.title}
                >

                  <SidebarMenuButton
                    isActive={
                      item.title === "Order Menu"
                    }
                    className="
                      h-9
                      rounded-lg
                      px-3
                      text-sm
                      hover:bg-[#eef4f1]
                      data-[active=true]:bg-[#173b35]
                      data-[active=true]:text-white
                    "
                    render={
                      <a
                        href={item.url}
                        className="flex w-full items-center gap-3"
                      >

                        <Icon className="h-4 w-4 shrink-0" />

                        <span className="flex-1">
                          {item.title}
                        </span>

                        {item.badge && (
                          <span
                            className="
                              flex
                              h-5
                              min-w-5
                              items-center
                              justify-center
                              rounded-full
                              bg-[#d94b16]
                              px-1
                              text-[9px]
                              font-medium
                              text-white
                            "
                          >
                            {item.badge}
                          </span>
                        )}

                      </a>
                    }
                  />

                </SidebarMenuItem>
              )
            })}

          </SidebarMenu>

        </SidebarGroup>

      </SidebarContent>


      {/* =====================================================
          SIDEBAR FOOTER
          ===================================================== */}

      <SidebarFooter className="p-3">

        {/* Logout */}

        <SidebarMenu>

          <SidebarMenuItem>

            <SidebarMenuButton
              className="
                h-9
                rounded-lg
                px-3
                text-sm
                text-[#d94b16]
                hover:bg-orange-50
              "
              render={
                <a
                  href="/logout"
                  className="flex items-center gap-3"
                >

                  <LogOut className="h-4 w-4" />

                  <span>
                    Log Out
                  </span>

                </a>
              }
            />

          </SidebarMenuItem>

        </SidebarMenu>


        {/* User */}

        <div className="mt-3 flex items-center gap-3 rounded-xl border bg-white p-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dce9df] text-xs font-semibold">
            AM
          </div>

          <div className="min-w-0">

            <p className="truncate text-xs font-semibold">
              Alex Morgan
            </p>

            <p className="truncate text-[9px] text-muted-foreground">
              alex.morgan@email.com
            </p>

          </div>

        </div>

      </SidebarFooter>

    </Sidebar>
  )
}