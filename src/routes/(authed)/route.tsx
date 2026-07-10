import { Outlet, createFileRoute } from "@tanstack/react-router"
import type { CSSProperties } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/shared/app-sidebar"

export const Route = createFileRoute("/(authed)")({
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16.25rem",
          } as CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-svh flex-col text-foreground">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
