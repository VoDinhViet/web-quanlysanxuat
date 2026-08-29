import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CloseCircle } from "@solar-icons/react"

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
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { cancelPaymentRequest } from "@/features/payment-requests/api/server-functions/cancel-payment-request.api"
import { markPaymentRequestPaid } from "@/features/payment-requests/api/server-functions/mark-payment-request-paid.api"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestDetailActionsProps = {
  detail: PaymentRequestDetail
}

// Only shows actions for PENDING requests.
// Dùng Dialog confirm trước khi thực hiện — cùng pattern PurchaseOrderConfirmDialog.tsx.
export function PaymentRequestDetailActions({
  detail,
}: PaymentRequestDetailActionsProps) {
  const queryClient = useQueryClient()
  const markPaymentRequestPaidFn = useServerFn(markPaymentRequestPaid)
  const cancelPaymentRequestFn = useServerFn(cancelPaymentRequest)

  const mutation = useMutation({
    mutationFn: (status: "PAID" | "CANCELLED") =>
      status === "PAID"
        ? markPaymentRequestPaidFn({ data: { paymentRequestId: detail.id } })
        : cancelPaymentRequestFn({ data: { paymentRequestId: detail.id } }),
    // No body on success (204) — invalidate list + detail so both refetch the new status.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
  })

  if (detail.status !== "PENDING") return null

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <PermissionGate permission="purchasing:approve">
          {/* Mark as PAID */}
          <Dialog onOpenChange={(next) => next && mutation.reset()}>
            <DialogTrigger asChild>
              <Button type="button" disabled={mutation.isPending}>
                <CheckCircle className="size-4" />
                Đã thanh toán
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận thanh toán</DialogTitle>
                <DialogDescription>
                  Xác nhận yêu cầu thanh toán{" "}
                  <span className="font-mono font-semibold">{detail.code}</span>{" "}
                  đã được chi? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              {mutation.error ? (
                <p className="text-sm text-destructive">
                  {mutation.error.message}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate("PAID")}
                >
                  {mutation.isPending
                    ? "Đang xử lý…"
                    : "Xác nhận đã thanh toán"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PermissionGate>

        <PermissionGate permission="purchasing:approve">
          {/* Cancel */}
          <Dialog onOpenChange={(next) => next && mutation.reset()}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive"
                disabled={mutation.isPending}
              >
                <CloseCircle className="size-4" />
                Hủy yêu cầu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hủy yêu cầu thanh toán</DialogTitle>
                <DialogDescription>
                  Bạn chắc chắn muốn hủy yêu cầu thanh toán{" "}
                  <span className="font-mono font-semibold">{detail.code}</span>
                  ? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              {mutation.error ? (
                <p className="text-sm text-destructive">
                  {mutation.error.message}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate("CANCELLED")}
                >
                  {mutation.isPending ? "Đang xử lý…" : "Hủy yêu cầu"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>
    </div>
  )
}
