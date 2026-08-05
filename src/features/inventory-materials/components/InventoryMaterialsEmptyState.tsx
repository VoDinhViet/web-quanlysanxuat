import { Warehouse } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"

export function InventoryMaterialsEmptyState() {
  return (
    <TableEmptyState
      icon={Warehouse}
      title="Không có vật tư nào"
      description="Thử thay đổi bộ lọc hoặc kiểm tra lại thời gian xem tồn."
    />
  )
}
