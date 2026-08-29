import { createFileRoute, redirect } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { InventoryReceiptUpdatePage } from "@/features/inventory-receipts/pages/InventoryReceiptUpdatePage"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"
import { canUpdateInventoryReceipt } from "@/lib/types/inventory-receipt.type"

// Dấu gạch dưới cuối `$inventoryReceiptId_` đưa route này ra khỏi việc lồng dưới
// `inventory-receipts_/$inventoryReceiptId.tsx` (trang chi tiết, không render <Outlet/>) —
// cùng cách orders_/$orderId_.update.tsx làm, xem comment ở đó.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-receipts_/$inventoryReceiptId_/update"
)({
  loader: async ({ context, params }) => {
    const detail = await context.queryClient.ensureQueryData(
      inventoryReceiptQueryOptions(params.inventoryReceiptId)
    )

    if (!canUpdateInventoryReceipt(detail.status)) {
      throw redirect({
        to: "/manage/inventory-receipts/$inventoryReceiptId",
        params: { inventoryReceiptId: params.inventoryReceiptId },
      })
    }
  },
  component: InventoryReceiptUpdatePage,
  pendingComponent: LayoutPagePending,
})
