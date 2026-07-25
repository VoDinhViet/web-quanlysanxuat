import { ClipboardList } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"

export function ProductMaterialsEmptyState() {
  return (
    <TableEmptyState
      icon={ClipboardList}
      title="Chưa có vật tư nào"
      description='Thêm vật tư vào cấu trúc sản phẩm ở tab "Cấu trúc & Công đoạn" để hiển thị tại đây.'
    />
  )
}
