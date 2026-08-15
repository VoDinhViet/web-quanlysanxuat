import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { InventoryReceiptCreateFromPoPage } from "@/features/inventory-receipts/pages/InventoryReceiptCreateFromPoPage"

// No loader: bước ① tự fetch PO qua useQuery (page/limit/q); các bước sau đọc PO detail đã
// cache theo purchaseOrderId chọn ở bước ① — không có gì cố định cần prefetch trước.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-receipts_/create-from-po"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "inventory:create"),
  component: InventoryReceiptCreateFromPoPage,
})
