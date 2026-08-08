import { EllipsisVertical, Pencil, Printer, Save } from "lucide-react"

import { DisabledAction } from "@/components/shared/DisabledAction"
import { PendingAction } from "@/components/shared/PendingAction"
import { PurchaseRequestApprovalActions } from "@/features/purchase-requests/components/detail/PurchaseRequestApprovalActions"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestDetailActionsProps = {
  detail: PurchaseRequestDetail
}

// Gửi duyệt/Duyệt/Từ chối are real now — PurchaseRequestApprovalActions switches on
// detail.status + permission. Lưu nháp/Sửa/In still have no backend route (no header PATCH, no
// create route, no print) — stay disabled with a tooltip via PendingAction/DisabledAction.
export function PurchaseRequestDetailActions({
  detail,
}: PurchaseRequestDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <PendingAction label="Lưu nháp" hint="chưa có API lưu nháp">
        <Save className="size-4" />
        Lưu nháp
      </PendingAction>
      <PurchaseRequestApprovalActions detail={detail} />
      <PendingAction label="Sửa" hint="chưa có màn chỉnh sửa">
        <Pencil className="size-4" />
        Sửa
      </PendingAction>
      <PendingAction label="In" hint="chưa hỗ trợ in phiếu">
        <Printer className="size-4" />
        In
      </PendingAction>
      <DisabledAction label="Thêm thao tác" hint="chưa có thao tác nào khác">
        <EllipsisVertical className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
