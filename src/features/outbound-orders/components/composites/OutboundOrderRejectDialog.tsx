import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { useAppForm } from "@/hooks/use-app-form"
import { rejectOutboundOrder } from "@/features/outbound-orders/api/server-functions/reject-outbound-order.api"
import { rejectOutboundOrderSchema } from "@/features/outbound-orders/schemas/reject-outbound-order.schema"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderRejectDialogProps = {
  order: OutboundOrderDetail
  trigger: ReactNode
}

// PENDING_APPROVAL → REJECTED, reason required — director-level (outbound:approve). A Dialog (not
// AlertDialog) because it needs an input field, not just a confirm/cancel choice.
export function OutboundOrderRejectDialog({
  order,
  trigger,
}: OutboundOrderRejectDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="sm:max-w-md">
        {/* The dialog unmounts content while closed, so the form (and its mutation
            state) re-mounts fresh each time the dialog opens. */}
        <OutboundOrderRejectForm order={order} onClose={() => setOpen(false)} />
      </Dialog>
    </DialogTrigger>
  )
}

type OutboundOrderRejectFormProps = {
  order: OutboundOrderDetail
  onClose: () => void
}

function OutboundOrderRejectForm({
  order,
  onClose,
}: OutboundOrderRejectFormProps) {
  const queryClient = useQueryClient()
  const rejectOutboundOrderFn = useServerFn(rejectOutboundOrder)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      rejectOutboundOrderFn({ data: { outboundOrderId: order.id, reason } }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({ queryKey: ["outbound-orders"] })
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validators: {
      onSubmit: rejectOutboundOrderSchema.pick({ reason: true }),
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
          Từ chối phiếu giao hàng {order.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Phiếu sẽ chuyển sang trạng thái "Bị từ chối". Người lập có thể gửi
          duyệt lại ngay.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do từ chối"
            required
            placeholder="Nhập lý do từ chối phiếu giao hàng"
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
          {mutation.isPending ? "Đang xử lý..." : "Từ chối"}
        </Button>
      </DialogFooter>
    </form>
  )
}
