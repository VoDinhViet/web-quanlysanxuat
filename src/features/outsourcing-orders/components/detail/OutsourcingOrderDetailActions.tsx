import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CloseCircle, Printer } from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cancelOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/cancel-outsourcing-order.api"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-order.type"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderDetailActionsProps = {
  order: OutsourcingOrderDetail
}

type ConfirmAction = "cancel" | null

// BE bỏ hẳn trạng thái nháp (docs/decisions/outsourcing-no-draft.md phía be-quanlysanxuat) —
// POST / giờ POSTED ngay, PATCH/DELETE/:id/post bị xoá hẳn. Chỉ còn "Hủy phiếu" (đảo bút toán nếu
// đã POSTED, chặn nếu còn OS-IN chưa hủy) — dữ liệu DRAFT cũ (nếu còn) vẫn hủy được bình thường.
export function OutsourcingOrderDetailActions({
  order,
}: OutsourcingOrderDetailActionsProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const queryClient = useQueryClient()
  const cancelOutsourcingOrderFn = useServerFn(cancelOutsourcingOrder)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] })

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelOutsourcingOrderFn({ data: { outsourcingOrderId: order.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const isCancelled = order.status === InventoryDocumentStatus.CANCELLED

  const closeConfirm = (open: boolean) => {
    if (!open) {
      setConfirmAction(null)
      cancelMutation.reset()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {!isCancelled && (
        <PermissionGate permission="outsourcing:update">
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive"
            onClick={() => setConfirmAction("cancel")}
          >
            <CloseCircle className="size-4" />
            Hủy phiếu
          </Button>
        </PermissionGate>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button
              type="button"
              variant="outline"
              className="pointer-events-none"
              disabled
            >
              <Printer className="size-4" />
              In phiếu
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>In phiếu — chưa có tính năng in phiếu</TooltipContent>
      </Tooltip>

      {confirmAction && (
        <Dialog open onOpenChange={closeConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hủy phiếu gia công ngoài</DialogTitle>
              <DialogDescription>
                {order.status === InventoryDocumentStatus.POSTED ? (
                  <>
                    Phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {order.code}
                    </span>{" "}
                    đã trừ tồn kho xuất — hủy sẽ đảo ngược bút toán và cộng lại
                    tồn kho đã trừ. Nếu phiếu đã có OS-IN (nhận hàng) liên kết
                    chưa hủy, thao tác sẽ thất bại.
                  </>
                ) : (
                  <>
                    Bạn chắc chắn muốn hủy phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {order.code}
                    </span>
                    ? Phiếu chưa trừ tồn nên không ảnh hưởng số liệu.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {cancelMutation.error && (
              <p className="text-sm text-destructive">
                {cancelMutation.error.message}
              </p>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => closeConfirm(false)}
                disabled={cancelMutation.isPending}
              >
                Đóng
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Đang xử lý…" : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
