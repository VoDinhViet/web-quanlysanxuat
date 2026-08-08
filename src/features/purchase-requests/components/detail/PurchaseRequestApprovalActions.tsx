import { CircleCheck, CircleX, Send } from "lucide-react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import { ApprovePurchaseRequestDialog } from "@/features/purchase-requests/components/detail/ApprovePurchaseRequestDialog"
import { RejectPurchaseRequestDialog } from "@/features/purchase-requests/components/detail/RejectPurchaseRequestDialog"
import { SendPurchaseRequestDialog } from "@/features/purchase-requests/components/detail/SendPurchaseRequestDialog"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestApprovalActionsProps = {
  detail: PurchaseRequestDetail
}

// The 3-button approval flow, mirroring OrderApprovalActions.tsx: DRAFT shows "Gửi duyệt"
// (purchase-requests:update, same as any edit); PENDING_APPROVAL shows "Từ chối"/"Duyệt"
// (purchase-requests:approve, director-level — seeded roles never hold both permissions, see
// credentials.seed.ts). Every other status (APPROVED, or REJECTED not yet reopened by an item
// edit) shows nothing — there's no direct action to take from there.
export function PurchaseRequestApprovalActions({
  detail,
}: PurchaseRequestApprovalActionsProps) {
  if (detail.status === PurchaseRequestStatus.DRAFT) {
    return (
      <PermissionGate permission="purchase-requests:update">
        <SendPurchaseRequestDialog
          detail={detail}
          trigger={
            <Button type="button">
              <Send className="size-4" />
              Gửi duyệt
            </Button>
          }
        />
      </PermissionGate>
    )
  }

  if (detail.status === PurchaseRequestStatus.PENDING_APPROVAL) {
    return (
      <PermissionGate permission="purchase-requests:approve">
        <div className="flex items-center gap-2">
          <RejectPurchaseRequestDialog
            detail={detail}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive"
              >
                <CircleX className="size-4" />
                Từ chối
              </Button>
            }
          />
          <ApprovePurchaseRequestDialog
            detail={detail}
            trigger={
              <Button type="button">
                <CircleCheck className="size-4" />
                Duyệt
              </Button>
            }
          />
        </div>
      </PermissionGate>
    )
  }

  return null
}
