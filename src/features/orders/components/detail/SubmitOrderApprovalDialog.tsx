import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Send } from "lucide-react"
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
import { submitOrderForApproval } from "@/features/orders/api/server-functions/submit-order-for-approval.api"
import type { OrderDetail } from "@/lib/types/order.type"

type SubmitOrderApprovalDialogProps = {
  order: OrderDetail
  trigger: ReactNode
}

// DRAFT → PENDING_CONFIRMATION — hands the order to a director for approval.
export function SubmitOrderApprovalDialog({
  order,
  trigger,
}: SubmitOrderApprovalDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const submitOrderForApprovalFn = useServerFn(submitOrderForApproval)

  const mutation = useMutation({
    mutationFn: () => submitOrderForApprovalFn({ data: { orderId: order.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
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
            <Send />
          </AlertDialogMedia>
          <AlertDialogTitle>Gửi duyệt đơn hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            Đơn hàng {order.code} sẽ chuyển sang trạng thái "Chờ xác nhận" và
            chờ Giám đốc duyệt.
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
