import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageShell } from "@/components/shared/layouts/PageShell"

// Layout route for /manage/inventory-requisitions — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the list's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-requisitions"
)({
  component: InventoryRequisitionsLayout,
})

function InventoryRequisitionsLayout() {
  return (
    <PageShell
      title="Danh sách lãnh vật tư"
      breadcrumbs={[{ label: "Quản lý sản xuất" }, { label: "Lãnh vật tư" }]}
    >
      <Outlet />
    </PageShell>
  )
}
