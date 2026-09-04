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
import { approveOutboundOrder } from "@/features/outbound-orders/api/server-functions/approve-outbound-order.api"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderApproveDialogProps = {
  order: OutboundOrderDetail
  trigger: ReactNode
}

// PENDING_APPROVAL → PENDING_DELIVERY — director-level, cần outbound:approve. Chưa trừ tồn kho,
// bước trừ tồn thật là OutboundOrderDeliverDialog.tsx.
export function OutboundOrderApproveDialog({
  order,
  trigger,
}: OutboundOrderApproveDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const approveOutboundOrderFn = useServerFn(approveOutboundOrder)

  const mutation = useMutation({
    mutationFn: () =>
      approveOutboundOrderFn({ data: { outboundOrderId: order.id } }),
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
            <CheckCircle />
          </AlertDialogMedia>
          <AlertDialogTitle>Duyệt phiếu giao hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${order.code} sẽ chuyển sang trạng thái "Chờ xác nhận giao" — chưa trừ tồn kho.`}
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
            {mutation.isPending ? "Đang xử lý..." : "Duyệt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
