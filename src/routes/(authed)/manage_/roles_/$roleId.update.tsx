import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { roleQueryOptions } from "@/features/roles/api/options"
import { UpdateRolePage } from "@/features/roles/pages/UpdateRolePage"

export const Route = createFileRoute("/(authed)/manage_/roles_/$roleId/update")(
  {
    loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(roleQueryOptions(params.roleId)),
    component: UpdateRolePage,
    pendingComponent: LayoutPagePending,
  }
)
