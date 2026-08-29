import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { SendSquare } from "@solar-icons/react"
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
import { sendPurchaseQuotation } from "@/features/purchase-quotations/api/server-functions/send-purchase-quotation.api"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type SendQuotationDialogProps = {
  purchaseQuotation: PurchaseQuotationDetail
  trigger: ReactNode
}

// DRAFT → PENDING_APPROVAL — the backend validates every vật tư has ≥1 NCC and every NCC has a
// non-null unitPrice (purchase_quotation.error.item_without_supplier/missing_unit_price); this
// dialog surfaces those as mutation.error.message rather than pre-computing the same check
// client-side.
export function SendQuotationDialog({
  purchaseQuotation,
  trigger,
}: SendQuotationDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const sendPurchaseQuotationFn = useServerFn(sendPurchaseQuotation)

  const mutation = useMutation({
    mutationFn: () =>
      sendPurchaseQuotationFn({
        data: { purchaseQuotationId: purchaseQuotation.id },
      }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({
        queryKey: ["purchase-quotations"],
      })
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
            <SendSquare />
          </AlertDialogMedia>
          <AlertDialogTitle>Gửi duyệt báo giá này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Báo giá ${purchaseQuotation.code} sẽ chuyển sang trạng thái "Chờ duyệt" và không sửa được nữa.`}
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
