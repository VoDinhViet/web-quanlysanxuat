import { Outlet, createFileRoute } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"

// Layout route for /manage/users — renders the real header immediately (no
// loader of its own, so it never enters a pending state) and an Outlet for
// the list's own route, which owns the data loading and its
// pendingComponent — see production-jobs' route.tsx for the pilot this
// mirrors.
export const Route = createFileRoute("/(authed)/manage_/users")({
  component: UsersLayout,
})

function UsersLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách nhân sự"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Danh sách nhân sự" },
        ]}
      />

      <Outlet />
    </main>
  )
}
