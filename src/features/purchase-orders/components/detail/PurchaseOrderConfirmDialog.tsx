import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CheckCircle } from "@solar-icons/react"
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
import { confirmPurchaseOrder } from "@/features/purchase-orders/api/server-functions/confirm-purchase-order.api"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderConfirmDialogProps = {
  detail: PurchaseOrderDetail
  trigger: ReactNode
}

// DRAFT → ORDERED (terminal short of a cancel). `trigger`'s own disabled state (set by
// PurchaseOrderDetailActions.tsx from the same 2 conditions the backend enforces — expectedDate
// set, every item priced) is the client-side precheck; the backend still re-validates.
export function PurchaseOrderConfirmDialog({
  detail,
  trigger,
}: PurchaseOrderConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const confirmPurchaseOrderFn = useServerFn(confirmPurchaseOrder)

  const mutation = useMutation({
    mutationFn: () =>
      confirmPurchaseOrderFn({ data: { purchaseOrderId: detail.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
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
            <CheckCircle />
          </AlertDialogMedia>
          <AlertDialogTitle>Xác nhận đặt hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Đơn mua hàng ${detail.code} sẽ chuyển sang trạng thái "Đã đặt hàng" và gửi cho NCC. Không thể sửa SL đặt/đơn giá sau khi xác nhận.`}
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
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
