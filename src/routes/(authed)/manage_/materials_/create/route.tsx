import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"

// Layout route for /manage/materials/create — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the form's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/materials_/create")({
  component: CreateMaterialLayout,
})

function CreateMaterialLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư", href: "/manage/materials" },
          { label: "Tạo vật tư" },
        ]}
        notificationCount={5}
      />

      <Outlet />
    </main>
  )
}
