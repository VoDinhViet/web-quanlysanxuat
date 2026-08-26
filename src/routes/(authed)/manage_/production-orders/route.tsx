import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"

// Layout route for /manage/production-orders — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the list's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/production-orders")({
  component: ProductionOrdersLayout,
})

function ProductionOrdersLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Lệnh sản xuất (LSX)"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Danh sách LSX" },
        ]}
      />

      <Outlet />
    </main>
  )
}
