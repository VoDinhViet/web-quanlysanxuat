import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CheckCircle } from "@solar-icons/react"
import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { confirmOutboundOrder } from "@/features/outbound-orders/api/server-functions/confirm-outbound-order.api"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderConfirmDialogProps = {
  order: OutboundOrderDetail
  trigger: ReactNode
}

// DRAFT → PENDING_DELIVERY. Backend chưa có route hủy/quay lại nên đây là bước không hoàn tác
// được — nêu thẳng trong description. Không tự pre-check gate OQC phía client (DO detail không có
// dữ liệu QC coverage của Job) — cùng nguyên tắc ApproveRequisitionDialog.tsx: chỉ hiện lỗi backend
// trả về, không tự tính trước.
export function OutboundOrderConfirmDialog({
  order,
  trigger,
}: OutboundOrderConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const confirmOutboundOrderFn = useServerFn(confirmOutboundOrder)

  const mutation = useMutation({
    mutationFn: () =>
      confirmOutboundOrderFn({ data: { outboundOrderId: order.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["outbound-orders"] })
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) mutation.reset()
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CheckCircle />
          </AlertDialogMedia>
          <AlertDialogTitle>Xác nhận phiếu giao hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${order.code} sẽ chuyển sang trạng thái "Chờ xác nhận giao" — chưa trừ tồn kho. Thao tác này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
