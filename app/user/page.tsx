import { AppSidebar } from "@/components/usercontent/usersidebar"
import { UserHeader } from "@/components/usercontent/userheader"
import { UserContent } from "@/components/usercontent/usercontent"

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"


export default function UserPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="bg-[#f3eee4]">

        {/* =========================================
            TOP BAR
        ========================================= */}

        <div className="flex items-center px-4 pt-3">
          <SidebarTrigger />
        </div>

        {/* =========================================
            NAVIGATION HEADER
        ========================================= */}

        <div className="px-4 pt-2">
          <UserHeader />
        </div>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}

        <main className="px-4 py-5">
          <UserContent />
        </main>

      </SidebarInset>
    </SidebarProvider>
  )
}