import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { rolesQueryOptions } from "@/features/roles/api/options"
import { RolesPage } from "@/features/roles/pages/RolesPage"

export const Route = createFileRoute("/(authed)/manage_/roles")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(rolesQueryOptions()),
  component: RolesPage,
  pendingComponent: PageLoading,
})
