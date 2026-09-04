import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CloseCircle } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { markPaymentRequestPaid } from "@/features/payment-requests/api/server-functions/mark-payment-request-paid.api"
import { PaymentRequestCancelDialog } from "@/features/payment-requests/components/composites/PaymentRequestCancelDialog"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestDetailActionsProps = {
  paymentRequest: PaymentRequestDetail
}

// Only shows actions for PENDING requests. "Đã thanh toán" is a confirm-only dialog (no reason
// needed); "Hủy yêu cầu" is its own dialog with a required reason field — see
// PaymentRequestCancelDialog.tsx.
export function PaymentRequestDetailActions({
  paymentRequest,
}: PaymentRequestDetailActionsProps) {
  const queryClient = useQueryClient()
  const markPaymentRequestPaidFn = useServerFn(markPaymentRequestPaid)

  const markPaidMutation = useMutation({
    mutationFn: () =>
      markPaymentRequestPaidFn({
        data: { paymentRequestId: paymentRequest.id },
      }),
    // No body on success (204) — invalidate list + paymentRequest so both refetch the new status.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
  })

  if (paymentRequest.status !== "PENDING") return null

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <PermissionGate permission="purchasing:approve">
          {/* Mark as PAID */}
          <DialogTrigger
            onOpenChange={(next) => next && markPaidMutation.reset()}
          >
            <Button type="button" isDisabled={markPaidMutation.isPending}>
              <CheckCircle className="size-4" />
              Đã thanh toán
            </Button>
            <Dialog>
              <DialogHeader>
                <DialogTitle>Xác nhận thanh toán</DialogTitle>
                <DialogDescription>
                  Xác nhận yêu cầu thanh toán{" "}
                  <span className="font-mono font-semibold">
                    {paymentRequest.code}
                  </span>{" "}
                  đã được chi? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              {markPaidMutation.error ? (
                <p className="text-sm text-destructive">
                  {markPaidMutation.error.message}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  isDisabled={markPaidMutation.isPending}
                  onPress={() => markPaidMutation.mutate()}
                >
                  {markPaidMutation.isPending
                    ? "Đang xử lý…"
                    : "Xác nhận đã thanh toán"}
                </Button>
              </DialogFooter>
            </Dialog>
          </DialogTrigger>
        </PermissionGate>

        <PermissionGate permission="purchasing:approve">
          <PaymentRequestCancelDialog
            paymentRequest={paymentRequest}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive"
              >
                <CloseCircle className="size-4" />
                Hủy yêu cầu
              </Button>
            }
          />
        </PermissionGate>
      </div>
    </div>
  )
}
