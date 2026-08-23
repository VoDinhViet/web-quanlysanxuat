import { createFileRoute } from "@tanstack/react-router"

import { InventoryRequisitionCreatePage } from "@/features/inventory-requisitions/pages/InventoryRequisitionCreatePage"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"

// Prefetch kho RM ("Kho nguyên vật liệu") — chỉ có đúng 1 kho loại này, form tự gắn warehouseId
// từ đây, không có picker nào cho người dùng chọn. Nguồn lãnh (LSX/thủ công) chọn bằng radio ở
// bước ① của form (không tách route) — Job vẫn là combobox async, không có gì cần prefetch.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-requisitions_/create"
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      warehouseOptionsQueryOptions({ type: "RM" })
    ),
  component: InventoryRequisitionCreatePage,
})
