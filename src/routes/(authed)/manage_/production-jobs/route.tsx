import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"

// Layout route for /manage/production-jobs — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the list's own route, which owns the data loading and its
// pendingComponent. Pilot for the "per-route skeleton... swapped in one
// route at a time" upgrade LayoutPagePending.tsx's own comment anticipates —
// see index.tsx for the data-owning child.
export const Route = createFileRoute("/(authed)/manage_/production-jobs")({
  component: ProductionJobsLayout,
})

function ProductionJobsLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý sản xuất"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý sản xuất" },
          { label: "Danh sách Job" },
        ]}
        notificationCount={5}
      />

      <Outlet />
    </main>
  )
}
