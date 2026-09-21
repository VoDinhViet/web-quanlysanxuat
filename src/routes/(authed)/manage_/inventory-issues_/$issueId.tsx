import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { inventoryIssueQueryOptions } from "@/features/inventory-issues/api/options"
import { InventoryIssueDetailPage } from "@/features/inventory-issues/pages/InventoryIssueDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/inventory-issues_/$issueId"
)({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...inventoryIssueQueryOptions(params.issueId),
      staleTime: "static",
    }),
  component: InventoryIssueDetailPage,
  pendingComponent: LayoutPagePending,
})
