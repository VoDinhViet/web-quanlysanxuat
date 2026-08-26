import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"

// Layout route for /manage/purchase-orders — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the list's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/purchase-orders")({
  component: PurchaseOrdersLayout,
})

function PurchaseOrdersLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Đơn mua hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đơn mua hàng" },
        ]}
        notificationCount={5}
      />

      <Outlet />
    </main>
  )
}
