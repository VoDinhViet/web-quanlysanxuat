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
import { PermissionGate } from "@/components/shared/PermissionGate"
import { mockUpdatePaymentRequestStatus } from "@/features/payment-requests/mock/payment-requests.mock"
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

  const mutation = useMutation({
    mutationFn: async (status: "PAID" | "CANCELLED") => {
      // Fake async — swap with a real server function call when backend ships.
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockUpdatePaymentRequestStatus(
        detail.id,
        status,
        "Người dùng hiện tại"
      )
    },
    onSuccess: (updated) => {
      if (!updated) return
      queryClient.setQueryData(
        ["payment-requests", "detail", detail.id],
        updated
      )
      // Also invalidate the list so the badge updates there too.
      void queryClient.invalidateQueries({
        queryKey: ["payment-requests", "list"],
      })
    },
  })

  if (detail.status !== "PENDING") return null

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <PermissionGate permission="purchasing:approve">
          {/* Mark as PAID */}
          <Dialog>
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
          <Dialog>
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
