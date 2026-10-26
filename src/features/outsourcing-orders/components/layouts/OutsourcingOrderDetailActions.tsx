import { useState } from "react"
import { CloseCircle, Printer } from "@solar-icons/react"
import { CheckCheck, Pencil, Send, Truck, Undo2 } from "lucide-react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { OutsourcingOrderActionConfirmDialog } from "@/features/outsourcing-orders/components/composites/OutsourcingOrderActionConfirmDialog"
import type { OutsourcingOrderConfirmAction } from "@/features/outsourcing-orders/components/composites/OutsourcingOrderActionConfirmDialog"
import { RejectOutsourcingOrderDialog } from "@/features/outsourcing-orders/components/composites/RejectOutsourcingOrderDialog"
import {
  canUpdateOutsourcingOrder,
  OutsourcingOrderStatus,
} from "@/lib/types/outsourcing-order.type"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderDetailActionsProps = {
  order: OutsourcingOrderDetail
}

// Nháp/Bị từ chối → Sửa, Gửi duyệt; Chờ duyệt → Duyệt, Từ chối; Đã duyệt → Xác nhận xuất gia công
// (hàng rời xưởng, từ đây mới nhập về được). Hủy phiếu dùng được ở mọi trạng thái chưa hủy, BE chặn
// nếu còn OS-IN chưa hủy.
export function OutsourcingOrderDetailActions({
  order,
}: OutsourcingOrderDetailActionsProps) {
  const [confirmAction, setConfirmAction] =
    useState<OutsourcingOrderConfirmAction | null>(null)

  const isCancelled = order.status === OutsourcingOrderStatus.CANCELLED
  const isEditable = canUpdateOutsourcingOrder(order.status)
  const isPendingApproval =
    order.status === OutsourcingOrderStatus.PENDING_APPROVAL
  const isApproved = order.status === OutsourcingOrderStatus.APPROVED

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isEditable && (
        <PermissionGate permission="outsourcing:update">
          <LinkButton
            to="/manage/outsourcing-orders/$outsourcingOrderId/update"
            params={{ outsourcingOrderId: order.id }}
            variant="outline"
          >
            <Pencil className="size-4" />
            Sửa phiếu
          </LinkButton>
          <Button type="button" onClick={() => setConfirmAction("submit")}>
            <Send className="size-4" />
            {order.status === OutsourcingOrderStatus.REJECTED
              ? "Gửi duyệt lại"
              : "Gửi duyệt"}
          </Button>
        </PermissionGate>
      )}

      {isPendingApproval && (
        <PermissionGate permission="outsourcing:approve">
          <RejectOutsourcingOrderDialog
            order={order}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive"
              >
                <Undo2 className="size-4" />
                Từ chối
              </Button>
            }
          />
          <Button type="button" onClick={() => setConfirmAction("approve")}>
            <CheckCheck className="size-4" />
            Duyệt phiếu
          </Button>
        </PermissionGate>
      )}

      {isApproved && (
        <PermissionGate permission="outsourcing:update">
          <Button
            type="button"
            onClick={() => setConfirmAction("confirm-send")}
          >
            <Truck className="size-4" />
            Xác nhận xuất gia công
          </Button>
        </PermissionGate>
      )}

      {!isCancelled && (
        <PermissionGate permission="outsourcing:update">
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive"
            onClick={() => setConfirmAction("cancel")}
          >
            <CloseCircle className="size-4" />
            Hủy phiếu
          </Button>
        </PermissionGate>
      )}

      <Tooltip>
        <TooltipTrigger
          render={
            <span tabIndex={0}>
              <Button
                type="button"
                variant="outline"
                className="pointer-events-none"
                disabled
              >
                <Printer className="size-4" />
                In phiếu
              </Button>
            </span>
          }
        />
        <TooltipContent>In phiếu — chưa có tính năng in phiếu</TooltipContent>
      </Tooltip>

      {confirmAction && (
        <OutsourcingOrderActionConfirmDialog
          order={order}
          action={confirmAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}
