import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Send } from "lucide-react"
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
import { sendPaymentRequest } from "@/features/payment-requests/api/server-functions/send-payment-request.api"
import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type SendPaymentRequestDialogProps = {
  paymentRequest: PaymentRequestDetail
  trigger: ReactElement
}

// DRAFT / REJECTED → PENDING — needs purchasing:update (người mua), kế toán duyệt ở bước sau
// bằng purchasing:approve. Mirrors SendPurchaseRequestDialog.tsx.
export function SendPaymentRequestDialog({
  paymentRequest,
  trigger,
}: SendPaymentRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const sendPaymentRequestFn = useServerFn(sendPaymentRequest)
  const actionLabel =
    paymentRequest.status === PaymentRequestStatus.REJECTED
      ? "Đề nghị lại"
      : "Đề nghị thanh toán"

  const mutation = useMutation({
    mutationFn: () =>
      sendPaymentRequestFn({
        data: { paymentRequestId: paymentRequest.id },
      }),
    onSuccess: async () => {
      setOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
    },
    // Same stale-status guard as PaymentRequestRejectDialog.
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        // A previous failure shouldn't greet the user on reopen.
        if (next) mutation.reset()
      }}
    >
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Send />
          </AlertDialogMedia>
          <AlertDialogTitle>{actionLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Yêu cầu ${paymentRequest.code} sẽ chuyển sang trạng thái "Chờ thanh toán" để kế toán xác nhận. Chi phí phát sinh sẽ bị khóa cho đến khi kế toán xử lý.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
