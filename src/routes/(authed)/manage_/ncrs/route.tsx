import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"

// Layout route for /manage/ncrs — real header immediately, the list child owns the loader.
export const Route = createFileRoute("/(authed)/manage_/ncrs")({
  component: NcrsLayout,
})

function NcrsLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách NCR"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Kiểm tra chất lượng (QC)" },
          { label: "NCR" },
        ]}
      />

      <Outlet />
    </main>
  )
}
