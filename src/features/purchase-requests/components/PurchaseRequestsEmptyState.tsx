import { ClipboardList } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"

// No action button — creation isn't built yet (giai đoạn 1 chỉ có GET /purchase-requests).
export function PurchaseRequestsEmptyState() {
  return (
    <TableEmptyState
      icon={ClipboardList}
      title="Chưa có đề xuất mua hàng nào"
      description="Đề xuất mua hàng sẽ hiển thị tại đây khi được tạo."
    />
  )
}
