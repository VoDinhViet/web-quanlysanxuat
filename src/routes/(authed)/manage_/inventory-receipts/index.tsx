import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { inventoryReceiptsQueryOptions } from "@/features/inventory-receipts/api/options"
import { InventoryReceiptsPage } from "@/features/inventory-receipts/pages/InventoryReceiptsPage"
import { inventoryReceiptsSearchSchema } from "@/features/inventory-receipts/schemas/inventory-receipts-search.schema"

export const Route = createFileRoute("/(authed)/manage_/inventory-receipts/")({
  validateSearch: inventoryReceiptsSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      inventoryReceiptsQueryOptions(
        inventoryReceiptsSearchSchema.parse(location.search)
      )
    ),
  component: InventoryReceiptsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
