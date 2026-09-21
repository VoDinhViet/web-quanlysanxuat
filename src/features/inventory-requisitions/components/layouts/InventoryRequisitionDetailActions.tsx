import { useNavigate } from "@tanstack/react-router"
import {
  CircleCheck,
  CircleX,
  PackageSearch,
  Printer,
  Send,
  Trash2,
} from "lucide-react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button, LinkButton } from "@/components/ui/button"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { ApproveRequisitionDialog } from "@/features/inventory-requisitions/components/composites/ApproveRequisitionDialog"
import { DeleteRequisitionDialog } from "@/features/inventory-requisitions/components/composites/DeleteRequisitionDialog"
import { RejectRequisitionDialog } from "@/features/inventory-requisitions/components/composites/RejectRequisitionDialog"
import { SendRequisitionDialog } from "@/features/inventory-requisitions/components/composites/SendRequisitionDialog"
import { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type InventoryRequisitionDetailActionsProps = {
  detail: InventoryRequisitionDetail
}

// Thao tác chuẩn theo luồng phê duyệt:
// - DRAFT: Xoá phiếu (xác nhận) / Gửi duyệt
// - PENDING_APPROVAL: Từ chối / Duyệt (người duyệt)
// - APPROVED: Xem phiếu xuất kho (nếu đã có PXK tự sinh)
// - In phiếu
export function InventoryRequisitionDetailActions({
  detail,
}: InventoryRequisitionDetailActionsProps) {
  const navigate = useNavigate()
  const isDraft = detail.status === InventoryRequisitionStatus.DRAFT
  const isPendingApproval =
    detail.status === InventoryRequisitionStatus.PENDING_APPROVAL
  const isApproved = detail.status === InventoryRequisitionStatus.APPROVED

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isDraft && (
        <>
          <PermissionGate permission="inventory-requisitions:delete">
            <DeleteRequisitionDialog
              requisition={detail}
              onDeleted={() => {
                void navigate({
                  to: "/manage/inventory-requisitions",
                  search: { page: 1, limit: 10 },
                })
              }}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  Xoá phiếu
                </Button>
              }
            />
          </PermissionGate>

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
        </>
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

      {isApproved && detail.inventoryIssue && (
        <LinkButton
          type="button"
          variant="outline"
          to="/manage/inventory-issues/$issueId"
          params={{ issueId: detail.inventoryIssue.id }}
        >
          <PackageSearch className="size-4" />
          Xem phiếu xuất kho
        </LinkButton>
      )}

      <PendingAction label="In" hint="chưa hỗ trợ in phiếu">
        <Printer className="size-4" />
        In
      </PendingAction>
    </div>
  )
}
