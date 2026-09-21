import { createFileRoute } from "@tanstack/react-router"

import { InventoryReceiptCreateReceiptPage } from "@/features/inventory-receipts/pages/InventoryReceiptCreateReceiptPage"
import { createInventoryReceiptLaneSearchSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt-lane-search.schema"

// No loader: không làn nào cần prefetch — làn "Khách hàng" chỉ có combobox khách hàng (async),
// làn "Từ PO" tự suy dữ liệu từ PO đã chọn lúc submit.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-receipts_/create-receipt"
)({
  validateSearch: createInventoryReceiptLaneSearchSchema,
  component: InventoryReceiptCreateReceiptPage,
})
