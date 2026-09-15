import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"

// Layout route for /manage/departments — renders the real header immediately (no loader of
// its own, so it never enters a pending state) and an Outlet for the list's own route, which
// owns the data loading and its pendingComponent — see units' route.tsx, the pattern this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/departments")({
  component: DepartmentsLayout,
})

function DepartmentsLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Phòng ban"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Phòng ban" },
        ]}
      />

      <Outlet />
    </main>
  )
}
