import { createFileRoute } from "@tanstack/react-router"

import { CreateRolePage } from "@/features/roles/pages/CreateRolePage"

// No loader: the permission checkbox matrix comes from the static `permissionGroups`
// const, nothing to prefetch.
export const Route = createFileRoute("/(authed)/manage_/roles_/create")({
  component: CreateRolePage,
})
