import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CheckCircle } from "@solar-icons/react"
import type { ReactElement } from "react"

import {
  AlertDialog,
  AlertDialogContent,
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
  trigger: ReactElement
}

// PENDING_APPROVAL → PENDING_DELIVERY ("Chờ xuất kho") — director-level, cần outbound:approve. BE sinh
// phiếu xuất kho SALES nháp; chưa trừ tồn kho, thủ kho ghi sổ phiếu đó mới trừ tồn và giao xong DO.
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outbound-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-issues"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
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
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CheckCircle />
          </AlertDialogMedia>
          <AlertDialogTitle>Duyệt phiếu giao hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${order.code} sẽ chuyển sang trạng thái "Chờ xuất kho" và tự sinh phiếu xuất kho thành phẩm cho thủ kho — chưa trừ tồn kho.`}
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
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Duyệt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
