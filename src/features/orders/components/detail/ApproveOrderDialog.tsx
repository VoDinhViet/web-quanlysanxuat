import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck } from "lucide-react"
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
import { approveOrder } from "@/features/orders/api/server-functions/approve-order.api"
import type { OrderDetail } from "@/lib/types/order.type"

type ApproveOrderDialogProps = {
  order: OrderDetail
  trigger: ReactNode
}

// PENDING_CONFIRMATION → AWAITING_PRODUCTION — director-level (orders:approve).
export function ApproveOrderDialog({
  order,
  trigger,
}: ApproveOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const approveOrderFn = useServerFn(approveOrder)

  const mutation = useMutation({
    mutationFn: () => approveOrderFn({ data: { orderId: order.id } }),
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
            <CircleCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>Duyệt đơn hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            Đơn hàng {order.code} sẽ chuyển sang trạng thái "Chờ sản xuất".
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
            {mutation.isPending ? "Đang xử lý..." : "Duyệt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
