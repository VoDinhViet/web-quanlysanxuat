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
import { approvePurchaseQuotation } from "@/features/purchase-quotations/api/server-functions/approve-purchase-quotation.api"
import type {
  PurchaseQuotationDetail,
  PurchaseQuotationSupplierSelection,
} from "@/lib/types/purchase-quotation.type"

type ApproveQuotationDialogProps = {
  detail: PurchaseQuotationDetail
  // quotationItemId -> quotationItemSupplierId, one entry per vật tư — collected by
  // PurchaseQuotationDetailQuotesSection's inline radio selection, passed down here only to be
  // confirmed and sent as-is.
  selectedSuppliers: PurchaseQuotationSupplierSelection
  trigger: ReactNode
}

// PENDING_APPROVAL → APPROVED (terminal short of a recall) — the final confirm step after
// picking a winning NCC for every vật tư inline in the compare table (PurchaseQuotationApprovalBar
// only enables this trigger once `selectedSuppliers` covers every item).
export function ApproveQuotationDialog({
  detail,
  selectedSuppliers,
  trigger,
}: ApproveQuotationDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const approvePurchaseQuotationFn = useServerFn(approvePurchaseQuotation)

  const distinctSupplierCount = new Set(Object.values(selectedSuppliers)).size

  const mutation = useMutation({
    mutationFn: () =>
      approvePurchaseQuotationFn({
        data: {
          purchaseQuotationId: detail.id,
          selectedSuppliers: Object.entries(selectedSuppliers).map(
            ([quotationItemId, quotationItemSupplierId]) => ({
              quotationItemId,
              quotationItemSupplierId,
            })
          ),
        },
      }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({
        queryKey: ["purchase-quotations"],
      })
      await queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
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
            <CheckCircle />
          </AlertDialogMedia>
          <AlertDialogTitle>Duyệt báo giá này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Báo giá ${detail.code} sẽ chuyển sang trạng thái "Đã duyệt". Hệ thống sẽ tạo ${distinctSupplierCount} đơn mua nháp cho ${distinctSupplierCount} NCC thắng thầu.`}
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
            {mutation.isPending ? "Đang xử lý..." : "Duyệt & tạo đơn mua"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
