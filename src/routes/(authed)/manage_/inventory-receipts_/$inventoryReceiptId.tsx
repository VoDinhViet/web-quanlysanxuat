import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"
import { InventoryReceiptDetailPage } from "@/features/inventory-receipts/pages/InventoryReceiptDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/inventory-receipts_/$inventoryReceiptId"
)({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...inventoryReceiptQueryOptions(params.inventoryReceiptId),
      staleTime: "static",
    }),
  component: InventoryReceiptDetailPage,
  pendingComponent: LayoutPagePending,
})
