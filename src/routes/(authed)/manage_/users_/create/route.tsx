import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"

// Layout route for /manage/users/create — renders the real header
// immediately (no loader of its own, so it never enters a pending state) and
// an Outlet for the form's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/users_/create")({
  component: CreateUserLayout,
})

function CreateUserLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Thêm nhân sự"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Nhân sự", href: "/manage/users" },
          { label: "Danh sách nhân sự", href: "/manage/users" },
          { label: "Thêm nhân sự" },
        ]}
        notificationCount={5}
      />

      <Outlet />
    </main>
  )
}
