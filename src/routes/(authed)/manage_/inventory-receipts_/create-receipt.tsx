import { createFileRoute } from "@tanstack/react-router"

import { InventoryReceiptCreateReceiptPage } from "@/features/inventory-receipts/pages/InventoryReceiptCreateReceiptPage"
import { createInventoryReceiptLaneSearchSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt-lane-search.schema"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"

// Prefetch kho RM ("Kho nguyên vật liệu") — chỉ có đúng 1 kho loại này, làn "Khách hàng"/"Khác"
// tự gắn warehouseId từ đây, không có picker nào cho người dùng chọn (cùng khuôn
// inventory-requisitions_/create.tsx). Làn "Từ PO" tự suy kho từ PO đã chọn, không đọc query này.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-receipts_/create-receipt"
)({
  validateSearch: createInventoryReceiptLaneSearchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      warehouseOptionsQueryOptions({ type: "RM" })
    ),
  component: InventoryReceiptCreateReceiptPage,
})
