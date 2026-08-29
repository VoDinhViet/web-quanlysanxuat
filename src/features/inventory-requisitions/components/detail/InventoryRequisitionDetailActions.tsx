import { CircleCheck, CircleX, PackageCheck, Printer, Send } from "lucide-react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { ApproveRequisitionDialog } from "@/features/inventory-requisitions/components/detail/ApproveRequisitionDialog"
import { CancelRequisitionDialog } from "@/features/inventory-requisitions/components/detail/CancelRequisitionDialog"
import { IssueRequisitionDialog } from "@/features/inventory-requisitions/components/detail/IssueRequisitionDialog"
import { RejectRequisitionDialog } from "@/features/inventory-requisitions/components/detail/RejectRequisitionDialog"
import { SendRequisitionDialog } from "@/features/inventory-requisitions/components/detail/SendRequisitionDialog"
import { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type InventoryRequisitionDetailActionsProps = {
  detail: InventoryRequisitionDetail
}

// Nút thao tác theo trạng thái, đúng lifecycle backend: DRAFT/REJECTED → Gửi duyệt,
// PENDING_APPROVAL → Từ chối/Duyệt, APPROVED → Xuất kho — mỗi nút bọc PermissionGate theo đúng
// permission route đòi (update cho send/cancel, approve cho approve/reject, issue cho issue).
// Huỷ phiếu hiện ở mọi trạng thái trừ ISSUED/CANCELLED (điểm cuối, không còn hành động nào).
// Không giữ mutation state ở đây — mỗi dialog con tự quản lý mutation của mình, component này chỉ
// quyết định nút nào hiện, cùng khuôn PurchaseRequestApprovalActions.tsx.
export function InventoryRequisitionDetailActions({
  detail,
}: InventoryRequisitionDetailActionsProps) {
  const isDraftOrRejected =
    detail.status === InventoryRequisitionStatus.DRAFT ||
    detail.status === InventoryRequisitionStatus.REJECTED
  const isPendingApproval =
    detail.status === InventoryRequisitionStatus.PENDING_APPROVAL
  const isApproved = detail.status === InventoryRequisitionStatus.APPROVED
  const canCancel =
    detail.status !== InventoryRequisitionStatus.ISSUED &&
    detail.status !== InventoryRequisitionStatus.CANCELLED

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isDraftOrRejected && (
        <PermissionGate permission="inventory-requisitions:update">
          <SendRequisitionDialog
            detail={detail}
            trigger={
              <Button type="button">
                <Send className="size-4" />
                Gửi duyệt
              </Button>
            }
          />
        </PermissionGate>
      )}

      {isPendingApproval && (
        <PermissionGate permission="inventory-requisitions:approve">
          <RejectRequisitionDialog
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
          <ApproveRequisitionDialog
            detail={detail}
            trigger={
              <Button type="button">
                <CircleCheck className="size-4" />
                Duyệt
              </Button>
            }
          />
        </PermissionGate>
      )}

      {isApproved && (
        <PermissionGate permission="inventory-requisitions:issue">
          <IssueRequisitionDialog
            detail={detail}
            trigger={
              <Button type="button">
                <PackageCheck className="size-4" />
                Xuất kho
              </Button>
            }
          />
        </PermissionGate>
      )}

      {canCancel && (
        <PermissionGate permission="inventory-requisitions:update">
          <CancelRequisitionDialog
            detail={detail}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive"
              >
                <CircleX className="size-4" />
                Huỷ phiếu
              </Button>
            }
          />
        </PermissionGate>
      )}

      <PendingAction label="In" hint="chưa hỗ trợ in phiếu">
        <Printer className="size-4" />
        In
      </PendingAction>
    </div>
  )
}
