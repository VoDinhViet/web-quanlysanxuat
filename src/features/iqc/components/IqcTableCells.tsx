import { Edit3, Eye } from "lucide-react"

import { DisabledAction } from "@/components/shared/DisabledAction"

// "PO / Lý do" — theo docs/domains/quality.md: có PO thì hiện mã PO, không thì hiện lý do tự do
// (reason, free text). Cả hai cùng null là biên hiếm (seed luôn set reason khi không có PO).
type IqcPoOrReasonCellProps = {
  purchaseOrder: { id: string; code: string } | null
  reason: string | null
}

export function IqcPoOrReasonCell({
  purchaseOrder,
  reason,
}: IqcPoOrReasonCellProps) {
  if (purchaseOrder) {
    return (
      <span className="font-mono text-xs font-semibold text-primary">
        {purchaseOrder.code}
      </span>
    )
  }

  if (reason) {
    return <span className="text-xs text-foreground">{reason}</span>
  }

  return <span className="text-xs text-muted-foreground">—</span>
}

// Cả "Xem chi tiết" lẫn "Chỉnh sửa" đều chưa có route (backend chỉ có GET list + GET stats + POST
// create, không có GET/PATCH theo id) — khác supplier-returns lúc mới dựng (chỉ "Chỉnh sửa" bị
// disable, "Xem chi tiết" mở được sheet từ dữ liệu list); ở đây cả 2 cùng chưa có gì để trỏ tới.
export function IqcActionsCell() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <DisabledAction label="Xem chi tiết" hint="chưa có màn chi tiết">
        <Eye className="size-3.5" />
      </DisabledAction>
      <DisabledAction label="Chỉnh sửa" hint="tính năng sắp có">
        <Edit3 className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
