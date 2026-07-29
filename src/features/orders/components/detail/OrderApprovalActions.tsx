import { CircleCheck, CircleX, Send } from "lucide-react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import { ApproveOrderDialog } from "@/features/orders/components/detail/ApproveOrderDialog"
import { RejectOrderDialog } from "@/features/orders/components/detail/RejectOrderDialog"
import { SubmitOrderApprovalDialog } from "@/features/orders/components/detail/SubmitOrderApprovalDialog"
import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderApprovalActionsProps = {
  order: OrderDetail
}

// The 3-button approval flow: DRAFT shows "Gửi duyệt" (orders:update, same as any edit);
// PENDING_CONFIRMATION shows "Duyệt"/"Từ chối" (orders:approve, director-level). Every
// other status shows nothing — the rest of the lifecycle still goes through the update
// form's status select.
export function OrderApprovalActions({ order }: OrderApprovalActionsProps) {
  if (order.status === OrderStatus.DRAFT) {
    return (
      <PermissionGate permission="orders:update">
        <SubmitOrderApprovalDialog
          order={order}
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
                className="border-destructive/30 bg-destructive/5 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              >
                <CircleX className="size-4" />
                Từ chối
              </Button>
            }
          />
          <ApproveOrderDialog
            order={order}
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
