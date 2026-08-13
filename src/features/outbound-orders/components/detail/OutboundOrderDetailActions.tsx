import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CloseCircle, Printer } from "@solar-icons/react"
import { SendHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { mockUpdateOutboundOrderStatus } from "@/features/outbound-orders/mock/outbound-orders.mock"
import { OutboundOrderPrintDialog } from "@/features/outbound-orders/components/detail/OutboundOrderPrintDialog"
import type {
  OutboundOrderDetail,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"

type OutboundOrderDetailActionsProps = {
  detail: OutboundOrderDetail
}

export function OutboundOrderDetailActions({
  detail,
}: OutboundOrderDetailActionsProps) {
  const [printOpen, setPrintOpen] = useState(false)
  const [confirmStatus, setConfirmStatus] =
    useState<OutboundOrderStatus | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (nextStatus: OutboundOrderStatus) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockUpdateOutboundOrderStatus(
        detail.id,
        nextStatus,
        "Người dùng hiện tại"
      )
    },
    onSuccess: (updated) => {
      if (!updated) return
      queryClient.setQueryData(
        ["outbound-orders", "detail", detail.id],
        updated
      )
      void queryClient.invalidateQueries({
        queryKey: ["outbound-orders", "list"],
      })
      setConfirmStatus(null)
    },
  })

  const isDraft = detail.status === "DRAFT"
  const isAwaitingApproval = detail.status === "AWAITING_APPROVAL"
  const isAwaitingDelivery = detail.status === "AWAITING_DELIVERY_CONFIRMATION"

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Print button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setPrintOpen(true)}
        >
          <Printer className="size-4" />
          In phiếu DO
        </Button>

        {/* Action: Submit for Approval if Draft */}
        {isDraft && (
          <PermissionGate permission="orders:update">
            <Button
              type="button"
              onClick={() => setConfirmStatus("AWAITING_APPROVAL")}
              disabled={mutation.isPending}
            >
              <SendHorizontal className="size-4" />
              Gửi duyệt DO
            </Button>
          </PermissionGate>
        )}

        {/* Action: Approve DO if Awaiting Approval */}
        {isAwaitingApproval && (
          <PermissionGate permission="orders:approve">
            <Button
              type="button"
              onClick={() => setConfirmStatus("AWAITING_DELIVERY_CONFIRMATION")}
              disabled={mutation.isPending}
            >
              <CheckCircle className="size-4" />
              Duyệt đơn DO
            </Button>
          </PermissionGate>
        )}

        {/* Action: Confirm Delivered if Awaiting Delivery */}
        {isAwaitingDelivery && (
          <PermissionGate permission="orders:update">
            <Button
              type="button"
              onClick={() => setConfirmStatus("DELIVERED")}
              disabled={mutation.isPending}
            >
              <CheckCircle className="size-4" />
              Xác nhận đã giao
            </Button>
          </PermissionGate>
        )}

        {/* Action: Cancel */}
        {(isDraft || isAwaitingApproval) && (
          <PermissionGate permission="orders:update">
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive"
              onClick={() => setConfirmStatus("CANCELLED")}
              disabled={mutation.isPending}
            >
              <CloseCircle className="size-4" />
              Hủy đơn DO
            </Button>
          </PermissionGate>
        )}
      </div>

      {/* Print Dialog */}
      <OutboundOrderPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        orderId={detail.id}
      />

      {/* Status Confirm Dialog */}
      {confirmStatus && (
        <Dialog
          open={Boolean(confirmStatus)}
          onOpenChange={(open) => !open && setConfirmStatus(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận chuyển trạng thái</DialogTitle>
              <DialogDescription>
                Bạn chắc chắn muốn chuyển đơn giao hàng{" "}
                <span className="font-mono font-semibold text-foreground">
                  {detail.code}
                </span>{" "}
                sang trạng thái mới?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmStatus(null)}
                disabled={mutation.isPending}
              >
                Hủy
              </Button>
              <Button
                variant={
                  confirmStatus === "CANCELLED" ? "destructive" : "default"
                }
                onClick={() => mutation.mutate(confirmStatus)}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Đang xử lý…" : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
