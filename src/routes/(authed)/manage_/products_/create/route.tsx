import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"

// Layout route for /manage/products/create — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the form's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/products_/create")({
  component: CreateProductLayout,
})

function CreateProductLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo sản phẩm"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Sản phẩm", href: "/manage/products" },
          { label: "Tạo sản phẩm" },
        ]}
      />

      <Outlet />
    </main>
  )
}
