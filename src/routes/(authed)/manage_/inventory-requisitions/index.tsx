import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { inventoryRequisitionsQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionsPage } from "@/features/inventory-requisitions/pages/InventoryRequisitionsPage"
import { inventoryRequisitionsSearchSchema } from "@/features/inventory-requisitions/schemas/inventory-requisitions-search.schema"

export const Route = createFileRoute(
  "/(authed)/manage_/inventory-requisitions/"
)({
  validateSearch: inventoryRequisitionsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match (that would
  // re-trigger this loader and blank the outlet). The list itself is read client-side in
  // InventoryRequisitionsPage via useQuery instead — same idiom as inventory-issues/index.tsx.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      inventoryRequisitionsQueryOptions(
        inventoryRequisitionsSearchSchema.parse(location.search)
      )
    ),
  component: InventoryRequisitionsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
