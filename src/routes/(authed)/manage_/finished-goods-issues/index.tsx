import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { inventoryIssuesQueryOptions } from "@/features/inventory-issues/api/options"
import { FinishedGoodsIssuesPage } from "@/features/inventory-issues/pages/FinishedGoodsIssuesPage"
import { finishedGoodsIssuesSearchSchema } from "@/features/inventory-issues/schemas/finished-goods-issues-search.schema"
import { InventoryIssueType } from "@/lib/types/inventory-issue.type"

export const Route = createFileRoute(
  "/(authed)/manage_/finished-goods-issues/"
)({
  validateSearch: finishedGoodsIssuesSearchSchema,
  // No loaderDeps, same reasoning as the inventory-issues list route.
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...inventoryIssuesQueryOptions({
        ...finishedGoodsIssuesSearchSchema.parse(location.search),
        issueType: InventoryIssueType.SALES,
      }),
      staleTime: "static",
    }),
  component: FinishedGoodsIssuesPage,
  pendingComponent: PagePending,
})
