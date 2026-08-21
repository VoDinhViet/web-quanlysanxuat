import { CircleX, Pencil, Printer, Trash2 } from "lucide-react"

import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
import { MaterialIssueStatus } from "@/lib/types/material-issue.type"
import type { MaterialIssue } from "@/lib/types/material-issue.type"

type MaterialIssueSourceCellProps = {
  productionOrderCode: string | null
  reason: string | null
}

// Ưu tiên hiện mã PO → lý do tự do → "—", cùng idiom InventoryIssueSourceCell.
export function MaterialIssueSourceCell({
  productionOrderCode,
  reason,
}: MaterialIssueSourceCellProps) {
  if (productionOrderCode) {
    return (
      <span className="font-mono text-xs font-semibold text-primary">
        {productionOrderCode}
      </span>
    )
  }

  if (reason) {
    return <span className="text-xs text-foreground">{reason}</span>
  }

  return <span className="text-xs text-muted-foreground">—</span>
}

type MaterialIssueActionsCellProps = {
  issue: MaterialIssue
}

// Chưa có route/API cho bất kỳ thao tác nào ở màn này — mọi nút đều là DisabledAction, hiện/ẩn
// theo trạng thái đúng thiết kế: Chờ duyệt đủ 4 nút (In/Sửa/Xoá/Huỷ), Đã duyệt còn In+Huỷ, Đã
// xuất/Đã hủy chỉ còn In.
export function MaterialIssueActionsCell({
  issue,
}: MaterialIssueActionsCellProps) {
  const isPendingApproval =
    issue.status === MaterialIssueStatus.PENDING_APPROVAL
  const isApproved = issue.status === MaterialIssueStatus.APPROVED

  return (
    <div className="flex items-center justify-center gap-1.5">
      <DisabledAction label="In phiếu" hint="chưa được xây dựng">
        <Printer className="size-3.5" />
      </DisabledAction>

      {isPendingApproval && (
        <DisabledAction label="Sửa phiếu" hint="chưa được xây dựng">
          <Pencil className="size-3.5" />
        </DisabledAction>
      )}

      {isPendingApproval && (
        <DisabledAction label="Xoá phiếu" hint="chưa được xây dựng">
          <Trash2 className="size-3.5" />
        </DisabledAction>
      )}

      {(isPendingApproval || isApproved) && (
        <DisabledAction label="Huỷ phiếu" hint="chưa được xây dựng">
          <CircleX className="size-3.5" />
        </DisabledAction>
      )}
    </div>
  )
}
