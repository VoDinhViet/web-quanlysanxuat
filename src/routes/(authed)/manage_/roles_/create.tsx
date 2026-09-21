import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { permissionCatalogueQueryOptions } from "@/features/roles/api/options"
import { CreateRolePage } from "@/features/roles/pages/CreateRolePage"

export const Route = createFileRoute("/(authed)/manage_/roles_/create")({
  loader: ({ context }) =>
    context.queryClient.query({
      ...permissionCatalogueQueryOptions(),
      staleTime: "static",
    }),
  component: CreateRolePage,
  pendingComponent: LayoutPagePending,
})
