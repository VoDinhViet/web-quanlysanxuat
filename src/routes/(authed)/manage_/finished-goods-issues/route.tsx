import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"

// Layout route for /manage/finished-goods-issues — same split as inventory-issues: the real header
// renders at once, the list route below owns the data loading.
export const Route = createFileRoute("/(authed)/manage_/finished-goods-issues")(
  {
    component: FinishedGoodsIssuesLayout,
  }
)

function FinishedGoodsIssuesLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Xuất kho thành phẩm"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Xuất kho thành phẩm" },
        ]}
      />

      <Outlet />
    </main>
  )
}
