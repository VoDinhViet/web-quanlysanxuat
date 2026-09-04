import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CloseCircle } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cancelPurchaseOrder } from "@/features/purchase-orders/api/server-functions/cancel-purchase-order.api"
import { cancelPurchaseOrderSchema } from "@/features/purchase-orders/schemas/cancel-purchase-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderCancelDialogProps = {
  purchaseOrder: PurchaseOrderDetail
  trigger: ReactNode
}

// DRAFT/ORDERED → CANCELLED (terminal), reason required — mirrors RejectQuotationDialog.tsx. A
// Dialog (not AlertDialog) because it needs a text field.
export function PurchaseOrderCancelDialog({
  purchaseOrder,
  trigger,
}: PurchaseOrderCancelDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="sm:max-w-md">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <PurchaseOrderCancelForm
          purchaseOrder={purchaseOrder}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </DialogTrigger>
  )
}

type PurchaseOrderCancelFormProps = {
  purchaseOrder: PurchaseOrderDetail
  onClose: () => void
}

function PurchaseOrderCancelForm({
  purchaseOrder,
  onClose,
}: PurchaseOrderCancelFormProps) {
  const queryClient = useQueryClient()
  const cancelPurchaseOrderFn = useServerFn(cancelPurchaseOrder)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      cancelPurchaseOrderFn({
        data: { purchaseOrderId: purchaseOrder.id, reason },
      }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validators: {
      onSubmit: cancelPurchaseOrderSchema.pick({ reason: true }),
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
      <DialogHeader className="gap-1">
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <CloseCircle className="size-4 text-destructive" />
          Huỷ đơn mua hàng {purchaseOrder.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Đơn mua hàng sẽ chuyển sang trạng thái "Đã hủy". Đây là quyết định
          cuối — không có đường quay lại.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do huỷ"
            required
            placeholder="Nhập lý do huỷ đơn mua hàng"
          />
        )}
      </form.AppField>

      {mutation.error ? (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      ) : null}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onPress={onClose}
          isDisabled={mutation.isPending}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="destructive"
          isDisabled={mutation.isPending}
        >
          {mutation.isPending ? "Đang xử lý..." : "Huỷ đơn"}
        </Button>
      </DialogFooter>
    </form>
  )
}
