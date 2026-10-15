import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Undo2 } from "lucide-react"
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
import { rejectPaymentRequest } from "@/features/payment-requests/api/server-functions/reject-payment-request.api"
import { rejectPaymentRequestSchema } from "@/features/payment-requests/schemas/reject-payment-request.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestRejectDialogProps = {
  paymentRequest: PaymentRequestDetail
  trigger: ReactElement
}

// PENDING → REJECTED, reason required — người mua sửa rồi đề nghị lại, khác Hủy (kết thúc hẳn).
// Mirrors PaymentRequestCancelDialog.tsx; a Dialog (not AlertDialog) because it needs a text field.
export function PaymentRequestRejectDialog({
  paymentRequest,
  trigger,
}: PaymentRequestRejectDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <PaymentRequestRejectForm
          paymentRequest={paymentRequest}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type PaymentRequestRejectFormProps = {
  paymentRequest: PaymentRequestDetail
  onClose: () => void
}

function PaymentRequestRejectForm({
  paymentRequest,
  onClose,
}: PaymentRequestRejectFormProps) {
  const queryClient = useQueryClient()
  const rejectPaymentRequestFn = useServerFn(rejectPaymentRequest)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      rejectPaymentRequestFn({
        data: { paymentRequestId: paymentRequest.id, reason },
      }),
    onSuccess: async () => {
      onClose()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
    },
    // A conflicting transition (someone else already paid / rejected it) leaves the page on a stale
    // status — refetch so the buttons match the real one while the error message stays visible.
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: rejectPaymentRequestSchema.pick({ reason: true }),
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
        <DialogTitle className="flex items-center gap-2 text-base font-medium">
          <Undo2 className="size-4 text-muted-foreground" />
          Từ chối thanh toán {paymentRequest.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Yêu cầu sẽ được trả về người mua hàng để sửa. Sau khi sửa, người mua
          có thể đề nghị thanh toán lại.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do từ chối"
            required
            maxLength={1000}
            placeholder="Nhập lý do từ chối thanh toán để người mua chỉnh sửa"
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
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Đóng
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Đang xử lý..." : "Từ chối thanh toán"}
        </Button>
      </DialogFooter>
    </form>
  )
}
