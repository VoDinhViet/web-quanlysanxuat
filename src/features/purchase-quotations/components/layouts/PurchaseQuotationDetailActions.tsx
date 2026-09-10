import { SendSquare } from "@solar-icons/react"
import { Pencil } from "lucide-react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button, LinkButton } from "@/components/ui/button"
import { RecallQuotationDialog } from "@/features/purchase-quotations/components/composites/RecallQuotationDialog"
import { SendQuotationDialog } from "@/features/purchase-quotations/components/composites/SendQuotationDialog"
import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationDetailActionsProps = {
  purchaseQuotation: PurchaseQuotationDetail
}

// Header-level status actions. Duyệt/Từ chối are deliberately NOT here — PENDING_APPROVAL
// selects a winning NCC per vật tư inline in the compare table, so those two actions live in
// PurchaseQuotationApprovalBar's sticky bar instead, to avoid two places doing the same job.
export function PurchaseQuotationDetailActions({
  purchaseQuotation,
}: PurchaseQuotationDetailActionsProps) {
  if (purchaseQuotation.status === PurchaseQuotationStatus.DRAFT) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <PermissionGate permission="purchasing:update">
          <LinkButton
            to="/manage/purchase-quotations/$purchaseQuotationId/update"
            params={{ purchaseQuotationId: purchaseQuotation.id }}
            variant="outline"
            className="gap-1.5"
          >
            <Pencil className="size-4" />
            Chỉnh sửa
          </LinkButton>

          <SendQuotationDialog
            purchaseQuotation={purchaseQuotation}
            trigger={
              <Button type="button">
                <SendSquare className="size-4" />
                Gửi duyệt
              </Button>
            }
          />
        </PermissionGate>
      </div>
    )
  }

  if (purchaseQuotation.status === PurchaseQuotationStatus.APPROVED) {
    return (
      <PermissionGate permission="purchasing:update">
        <RecallQuotationDialog
          purchaseQuotation={purchaseQuotation}
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
