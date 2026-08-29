import { EllipsisVertical, Printer } from "lucide-react"

import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { PurchaseRequestApprovalActions } from "@/features/purchase-requests/components/detail/PurchaseRequestApprovalActions"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestDetailActionsProps = {
  purchaseRequest: PurchaseRequestDetail
}

// Gửi duyệt/Duyệt/Từ chối are real now — PurchaseRequestApprovalActions switches on
// purchaseRequest.status + permission. Lưu nháp/Sửa were dropped (backend has no header PATCH to power
// either — no draft-save route, no edit screen). In still has no backend route — stays disabled
// with a tooltip via PendingAction.
export function PurchaseRequestDetailActions({
  purchaseRequest,
}: PurchaseRequestDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <PurchaseRequestApprovalActions purchaseRequest={purchaseRequest} />
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
