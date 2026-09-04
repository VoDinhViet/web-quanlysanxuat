import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TrashBinTrash } from "@solar-icons/react"
import { toast } from "sonner"
import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteOrder } from "@/features/orders/api/server-functions/delete-order.api"
import type { Order } from "@/lib/types/order.type"

type DeleteOrderDialogProps = {
  order: Pick<Order, "id" | "code">
  trigger: ReactNode
  onDeleted?: () => void
}

// Cùng khuôn DeleteOutboundOrderDialog.tsx — chỉ nên render khi order.status === DRAFT (BE cũng
// chặn lại bằng E264 nếu không, xem OrderTableCells.tsx's caller).
export function DeleteOrderDialog({
  order,
  trigger,
  onDeleted,
}: DeleteOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteOrderFn = useServerFn(deleteOrder)

  const mutation = useMutation({
    mutationFn: () => deleteOrderFn({ data: { orderId: order.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      onDeleted?.()
    },
    onError: (error) => {
      setOpen(false)
      toast.error(error.message)
    },
  })

  return (
    <AlertDialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TrashBinTrash />
          </AlertDialogMedia>
          <AlertDialogTitle>Xoá đơn hàng</AlertDialogTitle>
          <AlertDialogDescription>
            {`Bạn chắc chắn muốn xoá đơn "${order.code}"? Thao tác này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={mutation.isPending}>
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            isDisabled={mutation.isPending}
            onPress={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xoá…" : "Xoá đơn"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
