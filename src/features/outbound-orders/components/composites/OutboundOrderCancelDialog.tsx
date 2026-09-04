import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CloseCircle } from "@solar-icons/react"
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
import { cancelOutboundOrder } from "@/features/outbound-orders/api/server-functions/cancel-outbound-order.api"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderCancelDialogProps = {
  order: OutboundOrderDetail
  trigger: ReactNode
}

// DRAFT/PENDING_APPROVAL/PENDING_DELIVERY → CANCELLED (BUG-090) — cùng khuôn
// OutboundOrderApproveDialog.tsx. Không đụng tồn kho thật (cả ba trạng thái cho phép huỷ đều
// chưa `deliver`) — giữ chỗ FG tự hết vì HOLDING_STATUSES không còn khớp CANCELLED, xem
// docs/domains/inventory.md mục "Giao hàng".
export function OutboundOrderCancelDialog({
  order,
  trigger,
}: OutboundOrderCancelDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const cancelOutboundOrderFn = useServerFn(cancelOutboundOrder)

  const mutation = useMutation({
    mutationFn: () =>
      cancelOutboundOrderFn({ data: { outboundOrderId: order.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["outbound-orders"] })
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
            <CloseCircle />
          </AlertDialogMedia>
          <AlertDialogTitle>Hủy phiếu giao hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${order.code} sẽ chuyển sang trạng thái "Đã hủy" — thành phẩm đang giữ chỗ cho phiếu này sẽ được giải phóng ngay. Thao tác này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={mutation.isPending}>
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            isDisabled={mutation.isPending}
            onPress={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Hủy đơn DO"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
