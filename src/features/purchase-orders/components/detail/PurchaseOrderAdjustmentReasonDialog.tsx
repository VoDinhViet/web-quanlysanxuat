import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Diskette } from "@solar-icons/react"
import type { ReactNode } from "react"

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
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { updatePurchaseOrderItem } from "@/features/purchase-orders/api/server-functions/update-purchase-order-item.api"

type PurchaseOrderAdjustmentReasonDialogProps = {
  purchaseOrderItemId: string
  itemName: string
  reason: string
  trigger: ReactNode
}

// Local copy of purchase-quotations' AdjustmentReasonDialog.tsx — can't import it directly
// (Layer boundaries: a feature may not import another feature's components/ directly). The RFQ
// version writes to in-progress form state; this one is a real PATCH (own useMutation), same
// shape as PurchaseOrderExpectedDateField.tsx's mutation wiring. `purchaseOrderId` is a route
// param, read via `useParams` rather than threaded through the columns factory — same as
// PurchaseOrderItemQuantityCell.tsx/PurchaseOrderItemUnitPriceCell.tsx.
export function PurchaseOrderAdjustmentReasonDialog({
  purchaseOrderItemId,
  itemName,
  reason,
  trigger,
}: PurchaseOrderAdjustmentReasonDialogProps) {
  const { purchaseOrderId } = useParams({
    from: "/(authed)/manage_/purchase-orders_/$purchaseOrderId",
  })
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const updateItemFn = useServerFn(updatePurchaseOrderItem)

  const mutation = useMutation({
    mutationFn: (nextReason: string) =>
      updateItemFn({
        data: {
          purchaseOrderId,
          purchaseOrderItemId,
          quantityAdjustmentReason: nextReason || null,
        },
      }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) mutation.reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shadow-lg ring-0 sm:max-w-md">
        {/* Radix unmounts content while closed, so this form re-mounts on each open and its
            state seeds fresh from `reason`. */}
        <PurchaseOrderAdjustmentReasonForm
          itemName={itemName}
          reason={reason}
          isPending={mutation.isPending}
          error={mutation.error?.message}
          onSave={(value) => mutation.mutate(value)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type PurchaseOrderAdjustmentReasonFormProps = {
  itemName: string
  reason: string
  isPending: boolean
  error: string | undefined
  onSave: (reason: string) => void
  onCancel: () => void
}

function PurchaseOrderAdjustmentReasonForm({
  itemName,
  reason,
  isPending,
  error,
  onSave,
  onCancel,
}: PurchaseOrderAdjustmentReasonFormProps) {
  const [value, setValue] = useState(reason)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onSave(value)
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Lý do điều chỉnh SL
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          {itemName}
        </DialogDescription>
      </DialogHeader>

      <Field>
        <FieldLabel
          htmlFor="po-adjustment-reason-textarea"
          className="text-xs font-medium text-foreground"
        >
          Lý do
        </FieldLabel>
        <Textarea
          id="po-adjustment-reason-textarea"
          placeholder="Nhập lý do điều chỉnh số lượng (nếu có)"
          className="min-h-24 resize-none bg-background text-xs"
          value={value}
          disabled={isPending}
          onChange={(event) => setValue(event.target.value)}
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isPending}>
          <Diskette className="size-4" />
          {isPending ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogFooter>
    </form>
  )
}
