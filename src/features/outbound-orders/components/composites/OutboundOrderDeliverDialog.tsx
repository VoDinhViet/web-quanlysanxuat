import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CheckCircle } from "@solar-icons/react"
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
import { deliverOutboundOrder } from "@/features/outbound-orders/api/server-functions/deliver-outbound-order.api"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderDeliverDialogProps = {
  order: OutboundOrderDetail
  trigger: ReactNode
}

// PENDING_DELIVERY → DELIVERED. Ghi sổ thật (khác OutboundOrderApproveDialog.tsx): tự sinh + post 1
// phiếu xuất kho SALES, trừ tồn kho thành phẩm, và tự đóng đơn hàng nếu đã giao đủ — nêu rõ trong
// mô tả vì không hoàn tác được. Bốn nhánh cache đổi cùng lúc nên invalidate cả bốn, không chỉ
// "outbound-orders".
export function OutboundOrderDeliverDialog({
  order,
  trigger,
}: OutboundOrderDeliverDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deliverOutboundOrderFn = useServerFn(deliverOutboundOrder)

  const mutation = useMutation({
    mutationFn: () =>
      deliverOutboundOrderFn({ data: { outboundOrderId: order.id } }),
    onSuccess: async () => {
      setOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outbound-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-issues"] }),
      ])
    },
  })

  return (
    <AlertDialogTrigger
      isOpen={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) mutation.reset()
      }}
    >
      {trigger}
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CheckCircle />
          </AlertDialogMedia>
          <AlertDialogTitle>Xác nhận đã giao hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${order.code} sẽ chuyển sang trạng thái "Đã giao" — hệ thống tự sinh phiếu xuất kho và trừ tồn kho thành phẩm ngay, đơn hàng liên quan sẽ chuyển "Hoàn thành" nếu đã giao đủ. Thao tác này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            isDisabled={mutation.isPending}
            onPress={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
