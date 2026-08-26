import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"

// Layout route for /manage/inventory-products — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the list's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/inventory-products")({
  component: InventoryProductsLayout,
})

function InventoryProductsLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách tồn kho thành phẩm"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Tồn kho thành phẩm" },
        ]}
        notificationCount={5}
      />

      <Outlet />
    </main>
  )
}
