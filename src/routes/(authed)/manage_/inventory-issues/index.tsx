import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { inventoryIssuesQueryOptions } from "@/features/inventory-issues/api/options"
import { InventoryIssuesPage } from "@/features/inventory-issues/pages/InventoryIssuesPage"
import { inventoryIssuesSearchSchema } from "@/features/inventory-issues/schemas/inventory-issues-search.schema"

export const Route = createFileRoute("/(authed)/manage_/inventory-issues/")({
  validateSearch: inventoryIssuesSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match
  // (that would re-trigger this loader and blank the outlet). The list itself is read
  // client-side in InventoryIssuesPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...inventoryIssuesQueryOptions(
        inventoryIssuesSearchSchema.parse(location.search)
      ),
      staleTime: "static",
    }),
  component: InventoryIssuesPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
