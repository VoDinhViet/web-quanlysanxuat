import { createFileRoute } from "@tanstack/react-router"

import { InventoryRequisitionCreatePage } from "@/features/inventory-requisitions/pages/InventoryRequisitionCreatePage"

// No loader: nguồn lãnh (LSX/thủ công) chọn bằng radio ở bước ① của form (không tách route) —
// Job vẫn là combobox async, không có gì cần prefetch.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-requisitions_/create"
)({
  component: InventoryRequisitionCreatePage,
})
