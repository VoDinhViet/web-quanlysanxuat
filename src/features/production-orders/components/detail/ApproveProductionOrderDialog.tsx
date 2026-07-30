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
import { approveProductionOrder } from "@/features/production-orders/api/server-functions/approve-production-order.api"
import { ORDER_STATUS_LABELS, OrderStatus } from "@/lib/types/order.type"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

type ApproveProductionOrderDialogProps = {
  production: ProductionOrderDetail
  trigger: ReactNode
}

// PENDING → APPROVED, one-way — no un-approve route exists. Approving also pushes the underlying
// order to IN_PROGRESS in the same backend transaction, so both query roots get invalidated.
export function ApproveProductionOrderDialog({
  production,
  trigger,
}: ApproveProductionOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const approveProductionOrderFn = useServerFn(approveProductionOrder)

  const mutation = useMutation({
    mutationFn: () =>
      approveProductionOrderFn({ data: { productionOrderId: production.id } }),
    onSuccess: async () => {
      setOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["production-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ])
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
          <AlertDialogTitle>Duyệt lệnh sản xuất này?</AlertDialogTitle>
          <AlertDialogDescription>
            Lệnh sản xuất cho đơn hàng {production.order.code} sẽ được cấp mã
            LSX và chuyển sang trạng thái "Đã duyệt". Đơn hàng sẽ chuyển sang "
            {ORDER_STATUS_LABELS[OrderStatus.IN_PROGRESS]}". Sau khi duyệt, số
            lượng sản xuất không thể chỉnh sửa lại.
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
            {mutation.isPending ? "Đang xử lý..." : "Duyệt LSX"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
