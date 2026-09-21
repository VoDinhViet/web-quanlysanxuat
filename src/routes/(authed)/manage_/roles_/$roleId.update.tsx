import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import {
  permissionCatalogueQueryOptions,
  roleQueryOptions,
} from "@/features/roles/api/options"
import { UpdateRolePage } from "@/features/roles/pages/UpdateRolePage"

export const Route = createFileRoute("/(authed)/manage_/roles_/$roleId/update")(
  {
    loader: ({ context, params }) =>
      Promise.all([
        context.queryClient.query({
          ...roleQueryOptions(params.roleId),
          staleTime: "static",
        }),
        context.queryClient.query({
          ...permissionCatalogueQueryOptions(),
          staleTime: "static",
        }),
      ]),
    component: UpdateRolePage,
    pendingComponent: LayoutPagePending,
  }
)
