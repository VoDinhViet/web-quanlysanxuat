import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { inventoryIssuesQueryOptions } from "@/features/inventory-issues/api/options"
import { InventoryIssuesPage } from "@/features/inventory-issues/pages/InventoryIssuesPage"
import { inventoryIssuesSearchSchema } from "@/features/inventory-issues/schemas/inventory-issues-search.schema"

export const Route = createFileRoute("/(authed)/manage_/inventory-issues")({
  validateSearch: inventoryIssuesSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match
  // (that would re-trigger this loader and the router's pendingComponent, blanking the
  // whole page). The list itself is read client-side in InventoryIssuesPage via useQuery
  // instead.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      inventoryIssuesQueryOptions(
        inventoryIssuesSearchSchema.parse(location.search)
      )
    ),
  component: InventoryIssuesPage,
  pendingComponent: PageLoading,
})
