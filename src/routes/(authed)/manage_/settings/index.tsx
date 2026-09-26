import { createFileRoute, redirect } from "@tanstack/react-router"

import { hasPermission } from "@/lib/permissions"

export const Route = createFileRoute("/(authed)/manage_/settings/")({
  beforeLoad: ({ context }) => {
    const permissions = context.permissions ?? []
    if (
      !hasPermission(permissions, "items:read") &&
      hasPermission(permissions, "operations:read")
    ) {
      throw redirect({
        to: "/manage/settings/operations",
        search: { page: 1, limit: 10 },
      })
    }
    throw redirect({ to: "/manage/settings/units" })
  },
})
