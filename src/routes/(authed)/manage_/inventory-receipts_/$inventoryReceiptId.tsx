import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"
import { InventoryReceiptDetailPage } from "@/features/inventory-receipts/pages/InventoryReceiptDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/inventory-receipts_/$inventoryReceiptId"
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      inventoryReceiptQueryOptions(params.inventoryReceiptId)
    ),
  component: InventoryReceiptDetailPage,
  pendingComponent: PageLoading,
})
