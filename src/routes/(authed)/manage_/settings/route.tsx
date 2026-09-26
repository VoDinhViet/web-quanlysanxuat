import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Routing, Ruler } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { currentPermissionsQueryOptions } from "@/features/auth/api/options"
import { operationsQueryOptions } from "@/features/operations/api/options"
import { operationsSearchSchema } from "@/features/operations/schemas/operations-search.schema"
import { unitsQueryOptions } from "@/features/units/api/options"
import { hasPermission } from "@/lib/permissions"
import type { PermissionCode } from "@/lib/types/permission.type"

export const Route = createFileRoute("/(authed)/manage_/settings")({
  component: SettingsLayout,
})

type SettingsTab = {
  to: "/manage/settings/units" | "/manage/settings/operations"
  label: string
  icon: ComponentType<IconProps>
  permission: PermissionCode
  // undefined while the list is still loading.
  count: number | undefined
}

// Same tab strip as OutsourcingTabs.tsx (border-b-2 underline on the active tab), plus a record
// count per catalog.
const tabLinkClass =
  "flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground [&.active]:border-primary [&.active]:text-primary"

function SettingsLayout() {
  const { data: permissions = [] } = useQuery(currentPermissionsQueryOptions)

  const canReadUnits = hasPermission(permissions, "items:read")
  const canReadOperations = hasPermission(permissions, "operations:read")

  // Same query keys as the pages' unfiltered lists, so the request is shared, not duplicated.
  const unitsQuery = useQuery({
    ...unitsQueryOptions({}),
    enabled: canReadUnits,
  })
  const operationsQuery = useQuery({
    ...operationsQueryOptions(operationsSearchSchema.parse({})),
    enabled: canReadOperations,
  })

  const tabs: SettingsTab[] = [
    {
      to: "/manage/settings/units",
      label: "Đơn vị tính",
      icon: Ruler,
      permission: "items:read",
      count: unitsQuery.data?.length,
    },
    {
      to: "/manage/settings/operations",
      label: "Công đoạn sản xuất",
      icon: Routing,
      permission: "operations:read",
      count: operationsQuery.data?.length,
    },
  ]

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Cài đặt danh mục"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Cài đặt danh mục" },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-card">
          <nav
            aria-label="Cài đặt danh mục"
            className="flex flex-wrap items-center gap-1 border-b border-border px-1"
          >
            {tabs
              .filter((tab) => hasPermission(permissions, tab.permission))
              .map((tab) => (
                <Link key={tab.to} to={tab.to} className={tabLinkClass}>
                  <tab.icon className="size-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                      {tab.count}
                    </span>
                  )}
                </Link>
              ))}
          </nav>

          <Outlet />
        </section>
      </div>
    </main>
  )
}
