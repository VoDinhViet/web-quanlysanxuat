import { SendSquare } from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { RecallQuotationDialog } from "@/features/purchase-quotations/components/composites/RecallQuotationDialog"
import { SendQuotationDialog } from "@/features/purchase-quotations/components/composites/SendQuotationDialog"
import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationDetailActionsProps = {
  detail: PurchaseQuotationDetail
}

// Header-level status actions. Duyệt/Từ chối are deliberately NOT here — PENDING_APPROVAL
// selects a winning NCC per vật tư inline in the compare table, so those two actions live in
// PurchaseQuotationApprovalBar's sticky bar instead, to avoid two places doing the same job.
export function PurchaseQuotationDetailActions({
  detail,
}: PurchaseQuotationDetailActionsProps) {
  if (detail.status === PurchaseQuotationStatus.DRAFT) {
    return (
      <PermissionGate permission="purchasing:update">
        <SendQuotationDialog
          detail={detail}
          trigger={
            <Button type="button">
              <SendSquare className="size-4" />
              Gửi duyệt
            </Button>
          }
        />
      </PermissionGate>
    )
  }

  if (detail.status === PurchaseQuotationStatus.APPROVED) {
    return (
      <PermissionGate permission="purchasing:update">
        <RecallQuotationDialog
          detail={detail}
          trigger={
            <Button type="button" variant="outline">
              Thu hồi về nháp
            </Button>
          }
        />
      </PermissionGate>
    )
  }

  return null
}
