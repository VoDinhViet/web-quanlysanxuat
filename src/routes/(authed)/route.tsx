import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import type { CSSProperties } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { getCurrentSession } from "@/features/auth/server-functions/get-current-session"

export const Route = createFileRoute("/(authed)")({
  beforeLoad: async ({ location }) => {
    const result = await getCurrentSession()

    if (!result.success || !result.data) {
      throw redirect({
        to: "/login",
        search: { redirectTo: location.href },
      })
    }

    return { userId: result.data.userId }
  },
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
