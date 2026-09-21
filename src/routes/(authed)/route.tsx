import { Outlet, createFileRoute, useRouter } from "@tanstack/react-router"
import { AlertOctagon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import type { ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { AppSidebar } from "@/components/shared/layouts/AppSidebar"
import {
  currentPermissionsQueryOptions,
  currentUserQueryOptions,
} from "@/features/auth/api/options"
import {
  requireRoutePermissions,
  requireSession,
} from "@/features/auth/api/guard"
import { useSessionWatchdog } from "@/features/auth/hooks/use-session-watchdog"
import { getSidebarDefaultOpen } from "@/lib/sidebar-state"
import { getErrorMessage } from "@/lib/utils"

export const Route = createFileRoute("/(authed)")({
  beforeLoad: async ({ location, context, matches }) => {
    const user = await requireSession(location, context.queryClient)
    // Load the profile + effective permissions once (cached, separate queries) so every
    // nested route and component can read them without refetching. `permissions` is the
    // only value this beforeLoad needs back — listed first so the destructure doesn't need
    // an empty slot for the profile.
    const [permissions] = await Promise.all([
      context.queryClient.query({
        ...currentPermissionsQueryOptions,
        staleTime: "static",
      }),
      context.queryClient.query({
        ...currentUserQueryOptions,
        staleTime: "static",
      }),
    ])

    // One check for the whole destination — `matches` includes the child routes about to
    // render, so no page under `(authed)` needs its own guard (see route-permissions.ts).
    requireRoutePermissions(permissions, matches)

    return { user, permissions }
  },
  component: AuthedLayout,
  // `beforeLoad` above re-runs on every navigation, but every read in it (including
  // requireSession, via currentSessionQueryOptions) is a `query({ ..., staleTime: "static" })`
  // read-through — it returns whatever's cached and only fetches on a true cache miss — so it
  // resolves well under defaultPendingMs on any warm navigation, and this route only actually
  // enters "pending" once the cache entry itself is gone (evicted, or the very first load).
  // Without its own pendingComponent it would fall through to the router's sidebar-less
  // defaultPendingComponent for that rare case — see AuthedLayoutPending below.
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

// Shared by AuthedLayout and AuthedLayoutPending so the two look identical, sidebar included,
// on the rare navigation that does hit this route's pending state — only the child slot (real
// content vs. LayoutPagePending) differs between the two. NOTE this does NOT prevent a remount:
// AuthedLayout/AuthedLayoutPending are still two distinct component functions swapped at the
// same tree position, so React unmounts and remounts everything below, AuthedShell included,
// whenever the swap happens — sharing this function only makes that (now rare, see
// pendingComponent above) remount visually seamless instead of skipping it.
function AuthedShell({ children }: AuthedShellProps) {
  return (
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
