import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { InventoryDirectsPage } from "@/features/inventory-directs/pages/InventoryDirectsPage"
import { directInventoryQueryOptions } from "@/features/inventory-directs/api/options"
import { inventoryDirectsSearchSchema } from "@/features/inventory-directs/schemas/inventory-directs-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/inventory-directs/")({
  validateSearch: inventoryDirectsSearchSchema,
  // No loaderDeps: filter/pagination navigation must not create a new route
  // match (that would re-trigger the loader and blank the outlet). The list is
  // read client-side via useQuery. `location.search` is router-validated at
  // runtime — re-parsing it is the type-safe way to recover the real shape
  // without an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.query({
        ...directInventoryQueryOptions(
          inventoryDirectsSearchSchema.parse(location.search)
        ),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...supplierOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: InventoryDirectsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
