import { CheckCircle, CloseCircle, SendSquare } from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import { ApproveOrderDialog } from "@/features/orders/components/detail/ApproveOrderDialog"
import { ReqOrderApprovalDialog } from "@/features/orders/components/detail/ReqOrderApprovalDialog"
import { RejectOrderDialog } from "@/features/orders/components/detail/RejectOrderDialog"
import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderApprovalActionsProps = {
  order: OrderDetail
}

// The 3-button approval flow: DRAFT/REJECTED show "Gửi duyệt" (orders:update, same as any
// edit) — a REJECTED order can be resubmitted straight away, no edit required first;
// PENDING_CONFIRMATION shows "Duyệt"/"Từ chối" (orders:approve, director-level). Every other
// status shows nothing — once approved (AWAITING_PRODUCTION onward) the order is locked from
// editing entirely (see canUpdateOrder), so there's no later status-select path either.
export function OrderApprovalActions({ order }: OrderApprovalActionsProps) {
  if (
    order.status === OrderStatus.DRAFT ||
    order.status === OrderStatus.REJECTED
  ) {
    return (
      <PermissionGate permission="orders:update">
        <ReqOrderApprovalDialog
          order={order}
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

  if (order.status === OrderStatus.PENDING_CONFIRMATION) {
    return (
      <PermissionGate permission="orders:approve">
        <div className="flex items-center gap-2">
          <RejectOrderDialog
            order={order}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive"
              >
                <CloseCircle className="size-4" />
                Từ chối
              </Button>
            }
          />
          <ApproveOrderDialog
            order={order}
            trigger={
              <Button type="button">
                <CheckCircle className="size-4" />
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
