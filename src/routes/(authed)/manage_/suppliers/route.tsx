import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"

// Layout route for /manage/suppliers — renders the real header immediately
// (no loader of its own, so it never enters a pending state) and an Outlet
// for the list's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/suppliers")({
  component: SuppliersLayout,
})

function SuppliersLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý nhà cung cấp"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp" },
        ]}
        notificationCount={5}
      />

      <Outlet />
    </main>
  )
}
