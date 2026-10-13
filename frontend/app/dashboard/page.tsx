import { AppSidebar } from "@/components/dashboardcontent/sidebar"
import { DashboardHeader } from "@/components/dashboardcontent/navigation"
import { DashboardContent } from "@/components/dashboardcontent/dashboardcontent"

import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f7f7f6]">

        {/*SIDEBAR*/}

        <AppSidebar />


        {/* MAIN CONTENT */}

        <main className="min-w-0 flex-1">

          {/* 
              SIDEBAR TOGGLE
             */}

          <div className="px-3 pt-2">
            <SidebarTrigger />
          </div>


          {/* HEADER*/}

          <div className="px-4 pb-3 pt-1">
            <DashboardHeader />
          </div>


          {/* DASHBOARD CONTENT*/}

          <div className="px-4 pb-6">
            <DashboardContent />
          </div>

        </main>

      </div>
    </SidebarProvider>
  )
}