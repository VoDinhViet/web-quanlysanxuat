import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { inventoryProductsQueryOptions } from "@/features/inventory-products/api/options"
import { InventoryProductsPage } from "@/features/inventory-products/pages/InventoryProductsPage"
import { inventoryProductsSearchSchema } from "@/features/inventory-products/schemas/inventory-products-search.schema"

export const Route = createFileRoute("/(authed)/manage_/inventory-products/")({
  validateSearch: inventoryProductsSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...inventoryProductsQueryOptions(
        inventoryProductsSearchSchema.parse(location.search)
      ),
      staleTime: "static",
    }),
  component: InventoryProductsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
