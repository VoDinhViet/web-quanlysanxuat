import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/feedback/LayoutPagePending"
import { itemInventoryQueryOptions } from "@/features/inventory-products/api/options"
import { InventoryProductDetailPage } from "@/features/inventory-products/pages/InventoryProductDetailPage"
import { inventoryProductDetailSearchSchema } from "@/features/inventory-products/schemas/inventory-product-detail-search.schema"
import { itemQueryOptions } from "@/features/products/api"

// Ledger rows (the "ledger" tab) and the 4 "latest related document" cards are read client-side
// by their own components — not critical to the header/stat-tiles first paint, so only the item
// itself and its stock overview are prefetched here.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-products_/$itemId"
)({
  validateSearch: inventoryProductDetailSearchSchema,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(itemQueryOptions(params.itemId)),
      context.queryClient.ensureQueryData(
        itemInventoryQueryOptions(params.itemId)
      ),
    ]),
  component: InventoryProductDetailPage,
  pendingComponent: LayoutPagePending,
})
