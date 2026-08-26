import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"

// Layout route for /manage/clients/create — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the form's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/clients_/create")({
  component: CreateClientLayout,
})

function CreateClientLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo khách hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Khách hàng", href: "/manage/clients" },
          { label: "Tạo khách hàng" },
        ]}
        notificationCount={5}
      />

      <Outlet />
    </main>
  )
}
