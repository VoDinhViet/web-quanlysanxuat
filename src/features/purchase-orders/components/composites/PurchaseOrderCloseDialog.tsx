import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { LockKeyhole } from "@solar-icons/react"
import type { ReactElement } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { closePurchaseOrder } from "@/features/purchase-orders/api/server-functions/close-purchase-order.api"
import { closePurchaseOrderSchema } from "@/features/purchase-orders/schemas/close-purchase-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { PurchaseOrderCloseOutcomes } from "@/features/purchase-orders/components/composites/PurchaseOrderCloseOutcomes"
import { PurchaseOrderCloseSummary } from "@/features/purchase-orders/components/composites/PurchaseOrderCloseSummary"
import { PurchaseOrderCloseTable } from "@/features/purchase-orders/components/composites/PurchaseOrderCloseTable"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderCloseDialogProps = {
  purchaseOrder: PurchaseOrderDetail
  trigger: ReactElement
}

// Partially received ORDERED PO → closed early: each line's quantity drops to what was actually
// received, lines with nothing received are removed, a payment request is generated for the
// received amount. The preview below mirrors what the backend will do (closePurchaseOrder),
// computed from the detail's `receivedQuantity` and `unitPrice`.
export function PurchaseOrderCloseDialog({
  purchaseOrder,
  trigger,
}: PurchaseOrderCloseDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-3xl">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <PurchaseOrderCloseForm
          purchaseOrder={purchaseOrder}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type PurchaseOrderCloseFormProps = {
  purchaseOrder: PurchaseOrderDetail
  onClose: () => void
}

function PurchaseOrderCloseForm({
  purchaseOrder,
  onClose,
}: PurchaseOrderCloseFormProps) {
  const queryClient = useQueryClient()
  const closePurchaseOrderFn = useServerFn(closePurchaseOrder)

  const previewRows = purchaseOrder.items.map((line) => {
    const received = Math.min(line.receivedQuantity, line.quantity)
    return {
      id: line.id,
      itemCode: line.purchaseRequestItem.item.code,
      itemName: line.purchaseRequestItem.item.name,
      unitName: line.purchaseRequestItem.item.unit.name,
      ordered: line.quantity,
      received,
      amount: received * (line.unitPrice ?? 0),
      isRemoved: received === 0,
      isReduced: received > 0 && received < line.quantity,
    }
  })
  // Yêu cầu thanh toán tạo khi đóng sớm tính trên SL đã nhận: tiền hàng + VAT + chi phí khác.
  const originalAmount = purchaseOrder.totalAmount
  const closedSubtotal = previewRows.reduce((sum, row) => sum + row.amount, 0)
  const closedAmount =
    closedSubtotal * (1 + purchaseOrder.vatPercent / 100) +
    purchaseOrder.otherCost
  const shortCount = previewRows.filter(
    (row) => row.isRemoved || row.isReduced
  ).length

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      closePurchaseOrderFn({
        data: { purchaseOrderId: purchaseOrder.id, reason },
      }),
    onSuccess: async () => {
      onClose()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase-ledger"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: closePurchaseOrderSchema.pick({ reason: true }),
    },
    onSubmit: ({ value }) => mutation.mutate(value.reason),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="flex-row items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <LockKeyhole weight="Bold" className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-base font-semibold">
            Đóng sớm đơn mua hàng {purchaseOrder.code}
          </DialogTitle>
          <DialogDescription className="text-xs leading-normal">
            Chỉ ghi nhận phần hàng đã nhập. Phần chưa về sẽ bị bỏ khỏi đơn và
            không thể hoàn tác.
          </DialogDescription>
        </div>
      </DialogHeader>

      <PurchaseOrderCloseSummary
        originalAmount={originalAmount}
        closedAmount={closedAmount}
        shortCount={shortCount}
      />

      <PurchaseOrderCloseTable rows={previewRows} />

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do đóng sớm"
            required
            placeholder="Ví dụ: NCC hết hàng, không giao phần còn lại"
          />
        )}
      </form.AppField>

      <PurchaseOrderCloseOutcomes
        closedAmount={closedAmount}
        shortCount={shortCount}
      />

      {mutation.error ? (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      ) : null}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Quay lại
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Đang xử lý..." : "Đóng sớm PO"}
        </Button>
      </DialogFooter>
    </form>
  )
}
