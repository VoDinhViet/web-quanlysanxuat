import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { inventoryRequisitionsQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionsPage } from "@/features/inventory-requisitions/pages/InventoryRequisitionsPage"
import { inventoryRequisitionsSearchSchema } from "@/features/inventory-requisitions/schemas/inventory-requisitions-search.schema"

export const Route = createFileRoute(
  "/(authed)/manage_/inventory-requisitions"
)({
  validateSearch: inventoryRequisitionsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match (that would
  // re-trigger this loader and the router's pendingComponent, blanking the whole page). The list
  // itself is read client-side in InventoryRequisitionsPage via useQuery instead — same idiom as
  // inventory-issues.tsx.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      inventoryRequisitionsQueryOptions(
        inventoryRequisitionsSearchSchema.parse(location.search)
      )
    ),
  component: InventoryRequisitionsPage,
  pendingComponent: PageLoading,
})
