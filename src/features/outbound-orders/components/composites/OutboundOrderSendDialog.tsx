import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { SendSquare } from "@solar-icons/react"
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
import { sendOutboundOrder } from "@/features/outbound-orders/api/server-functions/send-outbound-order.api"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderSendDialogProps = {
  order: OutboundOrderDetail
  trigger: ReactNode
}

// DRAFT/REJECTED → PENDING_APPROVAL. Không tự pre-check gate OQC phía client — cùng nguyên tắc
// OutboundOrderDeliverDialog.tsx/ApproveRequisitionDialog.tsx: chỉ hiện lỗi backend trả về.
export function OutboundOrderSendDialog({
  order,
  trigger,
}: OutboundOrderSendDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const sendOutboundOrderFn = useServerFn(sendOutboundOrder)

  const mutation = useMutation({
    mutationFn: () =>
      sendOutboundOrderFn({ data: { outboundOrderId: order.id } }),
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
            <SendSquare />
          </AlertDialogMedia>
          <AlertDialogTitle>Gửi duyệt phiếu giao hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${order.code} sẽ chuyển sang trạng thái "Chờ duyệt" và chờ Giám đốc duyệt.`}
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
            {mutation.isPending ? "Đang xử lý..." : "Gửi duyệt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
