import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CloseCircle, Diskette } from "@solar-icons/react"
import { Loader2, Send, Undo2 } from "lucide-react"

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { markPaymentRequestPaid } from "@/features/payment-requests/api/server-functions/mark-payment-request-paid.api"
import { PaymentRequestCancelDialog } from "@/features/payment-requests/components/composites/PaymentRequestCancelDialog"
import { PaymentRequestRejectDialog } from "@/features/payment-requests/components/composites/PaymentRequestRejectDialog"
import { SendPaymentRequestDialog } from "@/features/payment-requests/components/composites/SendPaymentRequestDialog"
import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestDetailActionsProps = {
  paymentRequest: PaymentRequestDetail
  hasUnsavedChanges?: boolean
  isSaving?: boolean
  onSave?: () => void
  onRevert?: () => void
}

const UNSAVED_EXTRA_COST_HINT =
  "Vui lòng lưu chi phí phát sinh trước khi đề nghị thanh toán"

// PH-134 flow: DRAFT / REJECTED → người mua lưu phát sinh rồi "Đề nghị thanh toán" (hoặc "Đề nghị
// lại"); PENDING → kế toán "Từ chối" (dialog lý do) hoặc "Xác nhận thanh toán"; PAID / CANCELLED
// không còn thao tác. "Hủy yêu cầu" luôn là dialog riêng có lý do bắt buộc — see
// PaymentRequestCancelDialog.tsx.
export function PaymentRequestDetailActions({
  paymentRequest,
  hasUnsavedChanges = false,
  isSaving = false,
  onSave,
  onRevert,
}: PaymentRequestDetailActionsProps) {
  const queryClient = useQueryClient()
  const markPaymentRequestPaidFn = useServerFn(markPaymentRequestPaid)

  const markPaidMutation = useMutation({
    mutationFn: () =>
      markPaymentRequestPaidFn({
        data: { paymentRequestId: paymentRequest.id },
      }),
    // No body on success (204) — invalidate list + paymentRequest so both refetch the new status;
    // `reports` refreshes the sidebar's "yêu cầu chờ thanh toán" count.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ]),
    // Stale-status guard: a failed transition means the status changed under us, so refetch.
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
  })

  const isEditableByBuyer =
    paymentRequest.status === PaymentRequestStatus.DRAFT ||
    paymentRequest.status === PaymentRequestStatus.REJECTED
  const isAwaitingPayment =
    paymentRequest.status === PaymentRequestStatus.PENDING

  if (!isEditableByBuyer && !isAwaitingPayment) return null

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {isEditableByBuyer && hasUnsavedChanges && onRevert && (
          <Button
            type="button"
            variant="ghost"
            disabled={isSaving}
            onClick={onRevert}
            className="text-muted-foreground hover:text-foreground"
          >
            Hoàn tác
          </Button>
        )}

        {isEditableByBuyer && (
          <PermissionGate permission="purchasing:update">
            <Button
              type="button"
              variant={hasUnsavedChanges ? "default" : "outline"}
              disabled={isSaving || !hasUnsavedChanges}
              onClick={onSave}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Diskette className="size-4" />
              )}
              Lưu phát sinh
            </Button>
          </PermissionGate>
        )}

        {isEditableByBuyer && (
          <PermissionGate permission="purchasing:update">
            {hasUnsavedChanges ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span tabIndex={0}>
                      <Button type="button" disabled>
                        <Send className="size-4" />
                        {sendButtonLabel(paymentRequest)}
                      </Button>
                    </span>
                  }
                />
                <TooltipContent>{UNSAVED_EXTRA_COST_HINT}</TooltipContent>
              </Tooltip>
            ) : (
              <SendPaymentRequestDialog
                paymentRequest={paymentRequest}
                trigger={
                  <Button type="button">
                    <Send className="size-4" />
                    {sendButtonLabel(paymentRequest)}
                  </Button>
                }
              />
            )}
          </PermissionGate>
        )}

        {isAwaitingPayment && (
          <PermissionGate permission="purchasing:approve">
            <PaymentRequestRejectDialog
              paymentRequest={paymentRequest}
              trigger={
                <Button type="button" variant="outline">
                  <Undo2 className="size-4" />
                  Từ chối thanh toán
                </Button>
              }
            />
          </PermissionGate>
        )}

        {isAwaitingPayment && (
          <PermissionGate permission="purchasing:approve">
            <Dialog onOpenChange={(next) => next && markPaidMutation.reset()}>
              <DialogTrigger
                render={
                  <Button type="button" disabled={markPaidMutation.isPending}>
                    <CheckCircle className="size-4" />
                    Xác nhận thanh toán
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận thanh toán</DialogTitle>
                  <DialogDescription>
                    Xác nhận yêu cầu thanh toán{" "}
                    <span className="font-mono font-medium">
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
                    disabled={markPaidMutation.isPending}
                    onClick={() => markPaidMutation.mutate()}
                  >
                    {markPaidMutation.isPending
                      ? "Đang xử lý…"
                      : "Xác nhận đã thanh toán"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        )}

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

function sendButtonLabel(paymentRequest: PaymentRequestDetail): string {
  return paymentRequest.status === PaymentRequestStatus.REJECTED
    ? "Đề nghị lại"
    : "Đề nghị thanh toán"
}
