import { Outlet, createFileRoute, useRouter } from "@tanstack/react-router"
import { AlertOctagon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import type { ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LayoutPagePending } from "@/components/shared/feedback/LayoutPagePending"
import { AppSidebar } from "@/components/shared/layout/AppSidebar"
import {
  currentPermissionsQueryOptions,
  currentUserQueryOptions,
} from "@/features/auth/api/options"
import { requireRoutePermissions, requireSession } from "@/features/auth/guard"
import { useSessionWatchdog } from "@/features/auth/hooks/use-session-watchdog"
import { getSidebarDefaultOpen } from "@/lib/sidebar-state"
import { getErrorMessage } from "@/lib/utils"

export const Route = createFileRoute("/(authed)")({
  beforeLoad: async ({ location, context, matches }) => {
    const user = await requireSession(location)
    // Load the profile + effective permissions once (cached, separate queries) so every
    // nested route and component can read them without refetching. `permissions` is the
    // only value this beforeLoad needs back — listed first so the destructure doesn't need
    // an empty slot for the profile.
    const [permissions] = await Promise.all([
      context.queryClient.ensureQueryData(currentPermissionsQueryOptions),
      context.queryClient.ensureQueryData(currentUserQueryOptions),
    ])

    // One check for the whole destination — `matches` includes the child routes about to
    // render, so no page under `(authed)` needs its own guard (see route-permissions.ts).
    requireRoutePermissions(permissions, matches)

    return { user, permissions }
  },
  component: AuthedLayout,
  // `beforeLoad` above re-runs on every navigation (it's an uncached server round trip), so
  // this route re-enters "pending" on every click, not just first load. Without its own
  // pendingComponent it would fall through to the router's sidebar-less
  // defaultPendingComponent — see AuthedLayoutPending below.
  pendingComponent: AuthedLayoutPending,
  errorComponent: AuthedErrorFallback,
})

// A thrown server-function error (from any nested route's loader) bubbles up to this
// boundary and replaces the whole authed shell, including the sidebar — routes
// themselves don't catch, see CLAUDE.md "Server functions".
function AuthedErrorFallback({ error }: ErrorComponentProps) {
  const router = useRouter()
  const message = getErrorMessage(error)

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

type AuthedShellProps = {
  children: ReactNode
}

// Shared by AuthedLayout and AuthedLayoutPending so the sidebar/providers shell never
// disappears — only the child slot (real content vs. LayoutPagePending) differs between the two.
function AuthedShell({ children }: AuthedShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={getSidebarDefaultOpen()}
        style={
          {
            "--sidebar-width": "16.25rem",
          } as CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <div className="flex min-h-svh flex-col text-foreground">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function AuthedLayout() {
  useSessionWatchdog()

  return (
    <AuthedShell>
      <Outlet />
    </AuthedShell>
  )
}

// Same shell as AuthedLayout, LayoutPagePending (the same placeholder every leaf route's own
// pendingComponent already uses) standing in for the outlet — so this route's own pending
// window looks identical to a leaf route's, sidebar included, instead of blanking to the
// router's sidebar-less defaultPendingComponent.
function AuthedLayoutPending() {
  return (
    <AuthedShell>
      <LayoutPagePending />
    </AuthedShell>
  )
}
