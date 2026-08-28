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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteOutboundOrder } from "@/features/outbound-orders/api/server-functions/delete-outbound-order.api"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"

type DeleteOutboundOrderDialogProps = {
  order: Pick<OutboundOrder, "id" | "code">
  trigger: ReactNode
  onDeleted?: () => void
}

// Cùng khuôn DeleteOqcDialog.tsx — chỉ nên render khi order.status === DRAFT (BE cũng chặn lại
// bằng E258 nếu không, xem OutboundOrdersTableCells.tsx's caller).
export function DeleteOutboundOrderDialog({
  order,
  trigger,
  onDeleted,
}: DeleteOutboundOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteOutboundOrderFn = useServerFn(deleteOutboundOrder)

  const mutation = useMutation({
    mutationFn: () =>
      deleteOutboundOrderFn({ data: { outboundOrderId: order.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["outbound-orders"] })
      onDeleted?.()
    },
    onError: (error) => {
      setOpen(false)
      toast.error(error.message)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TrashBinTrash />
          </AlertDialogMedia>
          <AlertDialogTitle>Xoá phiếu giao hàng</AlertDialogTitle>
          <AlertDialogDescription>
            {`Bạn chắc chắn muốn xoá phiếu "${order.code}"? Thao tác này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xoá…" : "Xoá phiếu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
