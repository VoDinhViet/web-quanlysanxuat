import { useNavigate } from "@tanstack/react-router"
import {
  CloseCircle,
  PenNewSquare,
  SendSquare,
  TrashBinTrash,
} from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button, LinkButton } from "@/components/ui/button"
import { CancelQuotationDialog } from "@/features/purchase-quotations/components/composites/CancelQuotationDialog"
import { DeleteQuotationDialog } from "@/features/purchase-quotations/components/composites/DeleteQuotationDialog"
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
  const navigate = useNavigate()

  if (purchaseQuotation.status === PurchaseQuotationStatus.DRAFT) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <PermissionGate permission="purchasing:delete">
          <DeleteQuotationDialog
            purchaseQuotation={purchaseQuotation}
            onDeleted={() => {
              void navigate({
                to: "/manage/purchase-quotations",
                search: { page: 1, limit: 10 },
              })
            }}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <TrashBinTrash className="size-4" />
                Xoá báo giá
              </Button>
            }
          />
        </PermissionGate>

        <PermissionGate permission="purchasing:update">
          <LinkButton
            to="/manage/purchase-quotations/$purchaseQuotationId/update"
            params={{ purchaseQuotationId: purchaseQuotation.id }}
            variant="outline"
            className="gap-1.5"
          >
            <PenNewSquare className="size-4" />
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
      <div className="flex flex-wrap items-center gap-2">
        <PermissionGate permission="purchasing:approve">
          <CancelQuotationDialog
            purchaseQuotation={purchaseQuotation}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <CloseCircle className="size-4" />
                Hủy báo giá
              </Button>
            }
          />
        </PermissionGate>
      </div>
    )
  }

  return null
}
