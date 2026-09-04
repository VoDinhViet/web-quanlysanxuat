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
import { cancelPaymentRequest } from "@/features/payment-requests/api/server-functions/cancel-payment-request.api"
import { cancelPaymentRequestSchema } from "@/features/payment-requests/schemas/cancel-payment-request.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestCancelDialogProps = {
  paymentRequest: PaymentRequestDetail
  trigger: ReactNode
}

// PENDING → CANCELLED (terminal), reason required — mirrors PurchaseOrderCancelDialog.tsx. A
// Dialog (not AlertDialog) because it needs a text field.
export function PaymentRequestCancelDialog({
  paymentRequest,
  trigger,
}: PaymentRequestCancelDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="sm:max-w-md">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <PaymentRequestCancelForm
          paymentRequest={paymentRequest}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </DialogTrigger>
  )
}

type PaymentRequestCancelFormProps = {
  paymentRequest: PaymentRequestDetail
  onClose: () => void
}

function PaymentRequestCancelForm({
  paymentRequest,
  onClose,
}: PaymentRequestCancelFormProps) {
  const queryClient = useQueryClient()
  const cancelPaymentRequestFn = useServerFn(cancelPaymentRequest)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      cancelPaymentRequestFn({
        data: { paymentRequestId: paymentRequest.id, reason },
      }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({ queryKey: ["payment-requests"] })
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validators: {
      onSubmit: cancelPaymentRequestSchema.pick({ reason: true }),
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
          Hủy yêu cầu thanh toán {paymentRequest.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Yêu cầu thanh toán sẽ chuyển sang trạng thái "Đã hủy". Đây là quyết
          định cuối — không có đường quay lại.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do huỷ"
            required
            maxLength={1000}
            placeholder="Nhập lý do huỷ yêu cầu thanh toán"
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
          {mutation.isPending ? "Đang xử lý..." : "Hủy yêu cầu"}
        </Button>
      </DialogFooter>
    </form>
  )
}
