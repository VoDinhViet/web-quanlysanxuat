import { Outlet, createFileRoute, useRouter } from "@tanstack/react-router"
import { AlertOctagon } from "lucide-react"
import type { CSSProperties } from "react"
import type { ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { requireSession } from "@/features/auth/guard"

export const Route = createFileRoute("/(authed)")({
  beforeLoad: async ({ location }) => {
    const user = await requireSession(location)

    return { user }
  },
  component: AuthedLayout,
  errorComponent: AuthedErrorFallback,
})

// A thrown server-function error (from any nested route's loader) bubbles up to this
// boundary and replaces the whole authed shell, including the sidebar — routes
// themselves don't catch, see CLAUDE.md "Server functions".
function AuthedErrorFallback({ error }: ErrorComponentProps) {
  const router = useRouter()
  const message =
    error instanceof Error
      ? error.message
      : "Đã có lỗi xảy ra. Vui lòng thử lại."

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
      <AlertOctagon className="size-10 text-destructive" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      <Button type="button" onClick={() => void router.invalidate()}>
        Thử lại
      </Button>
    </main>
  )
}

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
