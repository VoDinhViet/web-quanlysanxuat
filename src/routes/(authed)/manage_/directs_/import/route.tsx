import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"

// Layout route for /manage/directs/import — renders the real header immediately and an Outlet
// for the wizard page; mirrors directs_/create/route.tsx.
export const Route = createFileRoute("/(authed)/manage_/directs_/import")({
  component: ImportDirectsLayout,
})

function ImportDirectsLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Nhập vật tư từ Excel"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư", href: "/manage/directs" },
          { label: "Nhập từ Excel" },
        ]}
      />

      <Outlet />
    </main>
  )
}
