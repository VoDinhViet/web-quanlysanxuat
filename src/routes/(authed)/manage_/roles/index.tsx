import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { rolesQueryOptions } from "@/features/roles/api/options"
import { RolesPage } from "@/features/roles/pages/RolesPage"

export const Route = createFileRoute("/(authed)/manage_/roles/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(rolesQueryOptions()),
  component: RolesPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
