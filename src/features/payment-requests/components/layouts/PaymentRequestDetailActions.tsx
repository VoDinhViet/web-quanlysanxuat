import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CloseCircle, Diskette } from "@solar-icons/react"
import { Loader2 } from "lucide-react"

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
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestDetailActionsProps = {
  paymentRequest: PaymentRequestDetail
  hasUnsavedChanges?: boolean
  isSaving?: boolean
  onSave?: () => void
  onRevert?: () => void
}

// Only shows actions for PENDING requests. "Đã thanh toán" is a confirm-only dialog (no reason
// needed); "Hủy yêu cầu" is its own dialog with a required reason field — see
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
  })

  if (paymentRequest.status !== "PENDING") return null

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {hasUnsavedChanges && onRevert && (
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

        <PermissionGate permission="purchasing:approve">
          {hasUnsavedChanges ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span tabIndex={0}>
                    <Button type="button" disabled>
                      <CheckCircle className="size-4" />
                      Đã thanh toán
                    </Button>
                  </span>
                }
              />
              <TooltipContent>
                Vui lòng lưu chi phí phát sinh trước khi xác nhận thanh toán
              </TooltipContent>
            </Tooltip>
          ) : (
            <Dialog onOpenChange={(next) => next && markPaidMutation.reset()}>
              <DialogTrigger
                render={
                  <Button type="button" disabled={markPaidMutation.isPending}>
                    <CheckCircle className="size-4" />
                    Đã thanh toán
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
          )}
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
