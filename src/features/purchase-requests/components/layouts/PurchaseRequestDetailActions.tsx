import { EllipsisVertical, Loader2, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DeletePurchaseRequestDialog } from "@/features/purchase-requests/components/composites/DeletePurchaseRequestDialog"
import { PurchaseRequestApprovalActions } from "@/features/purchase-requests/components/layouts/PurchaseRequestApprovalActions"
import { PurchaseRequestExportActions } from "@/features/purchase-requests/components/layouts/PurchaseRequestExportActions"
import type { UsePurchaseRequestNoteResult } from "@/features/purchase-requests/hooks/use-purchase-request-note"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestDetailActionsProps = {
  purchaseRequest: PurchaseRequestDetail
  noteDraft: UsePurchaseRequestNoteResult
}

// Gửi duyệt/Duyệt/Từ chối are real now — PurchaseRequestApprovalActions switches on
// purchaseRequest.status + permission. Lưu nháp/Sửa were dropped (backend has no header PATCH to power
// either — no draft-save route, no edit screen).
export function PurchaseRequestDetailActions({
  purchaseRequest,
  noteDraft,
}: PurchaseRequestDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <PurchaseRequestApprovalActions purchaseRequest={purchaseRequest} />
      {(purchaseRequest.status === PurchaseRequestStatus.DRAFT ||
        purchaseRequest.status === PurchaseRequestStatus.REJECTED) && (
        <PermissionGate permission="purchase-requests:delete">
          <DeletePurchaseRequestDialog
            purchaseRequest={purchaseRequest}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive"
              >
                <Trash2 className="size-4" />
                Xóa đề xuất
              </Button>
            }
          />
        </PermissionGate>
      )}
      {noteDraft.editable && (
        <Button
          type="button"
          disabled={!noteDraft.isDirty || noteDraft.isPending}
          onClick={noteDraft.save}
        >
          {noteDraft.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu
        </Button>
      )}
      <PurchaseRequestExportActions purchaseRequestId={purchaseRequest.id} />
      <DisabledAction label="Thêm thao tác" hint="chưa có thao tác nào khác">
        <EllipsisVertical className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
