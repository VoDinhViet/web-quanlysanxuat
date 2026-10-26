import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { approveOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/approve-outsourcing-order.api"
import { cancelOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/cancel-outsourcing-order.api"
import { confirmSendOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/confirm-send-outsourcing-order.api"
import { submitOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/submit-outsourcing-order.api"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

export type OutsourcingOrderConfirmAction =
  | "submit"
  | "approve"
  | "confirm-send"
  | "cancel"

type OutsourcingOrderActionConfirmDialogProps = {
  order: OutsourcingOrderDetail
  action: OutsourcingOrderConfirmAction
  onClose: () => void
}

const confirmCopy: Record<
  OutsourcingOrderConfirmAction,
  { title: string; description: string }
> = {
  submit: {
    title: "Gửi duyệt phiếu gia công ngoài",
    description:
      "sẽ được gửi cho người có quyền duyệt. Trong lúc chờ duyệt, phiếu không sửa được.",
  },
  approve: {
    title: "Duyệt phiếu gia công ngoài",
    description:
      "sẽ chuyển sang Đã duyệt. Hàng chỉ coi là rời xưởng khi bấm Xác nhận xuất gia công.",
  },
  "confirm-send": {
    title: "Xác nhận xuất gia công ngoài",
    description:
      "sẽ chuyển sang Đang gia công: hàng đã rời xưởng, từ đây mới nhập hàng về được.",
  },
  cancel: {
    title: "Hủy phiếu gia công ngoài",
    description:
      "sẽ bị hủy và trả lại số lượng đã giữ chỗ trên định mức của Job. Nếu phiếu đã có OS-IN (nhận hàng) liên kết chưa hủy, thao tác sẽ thất bại.",
  },
}

// Hộp xác nhận cho 4 bước đổi trạng thái không cần nhập thêm gì; "Từ chối" cần lý do nên có dialog
// riêng (RejectOutsourcingOrderDialog). Mount khi có `action`, đóng bằng `onClose`.
export function OutsourcingOrderActionConfirmDialog({
  order,
  action,
  onClose,
}: OutsourcingOrderActionConfirmDialogProps) {
  const queryClient = useQueryClient()
  const submitOrderFn = useServerFn(submitOutsourcingOrder)
  const approveOrderFn = useServerFn(approveOutsourcingOrder)
  const confirmSendOrderFn = useServerFn(confirmSendOutsourcingOrder)
  const cancelOrderFn = useServerFn(cancelOutsourcingOrder)

  const mutation = useMutation({
    mutationFn: () => {
      const orderFnByAction = {
        submit: submitOrderFn,
        approve: approveOrderFn,
        "confirm-send": confirmSendOrderFn,
        cancel: cancelOrderFn,
      }

      return orderFnByAction[action]({
        data: { outsourcingOrderId: order.id },
      })
    },
    onSuccess: async () => {
      // Badge menu đếm theo trạng thái phiếu; OS-IN chỉ nhận phiếu đã xuất nên picker nhập về cũng
      // đổi khi xác nhận xuất hoặc hủy.
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
      void queryClient.invalidateQueries({ queryKey: ["outsourcing-receipts"] })
      await queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] })
      onClose()
    },
    // Chuyển trạng thái xung đột thì trang đang giữ trạng thái cũ: tải lại để nút khớp trạng thái
    // thật, lỗi vẫn hiện trong dialog.
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] }),
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmCopy[action].title}</DialogTitle>
          <DialogDescription>
            Phiếu{" "}
            <span className="font-mono font-medium text-foreground">
              {order.code}
            </span>{" "}
            {confirmCopy[action].description}
          </DialogDescription>
        </DialogHeader>

        {mutation.error && (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Đóng
          </Button>
          <Button
            variant={action === "cancel" ? "destructive" : "default"}
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Đang xử lý…" : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
