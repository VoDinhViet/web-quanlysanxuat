import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleX, Printer } from "lucide-react"

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
import { cancelOutsourcingReceipt } from "@/features/outsourcing-receipts/api/server-functions/cancel-outsourcing-receipt.api"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-receipt.type"
import type { OutsourcingReceiptDetail } from "@/lib/types/outsourcing-receipt.type"

type OutsourcingReceiptDetailActionsProps = {
  receipt: OutsourcingReceiptDetail
}

type ConfirmAction = "cancel" | null

// BE bỏ hẳn trạng thái nháp (docs/decisions/outsourcing-no-draft.md phía be-quanlysanxuat) —
// POST / giờ POSTED ngay (không đụng inventory_balances — gia công ngoài là WIP, không quản tồn
// theo kho, xem docs/decisions/wip-not-stocked.md), sinh IQC cùng transaction nếu requiresIqc.
// Chỉ còn "Hủy phiếu" (chặn nếu đã sinh IQC liên kết — E173).
export function OutsourcingReceiptDetailActions({
  receipt,
}: OutsourcingReceiptDetailActionsProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const queryClient = useQueryClient()
  const cancelOutsourcingReceiptFn = useServerFn(cancelOutsourcingReceipt)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["outsourcing-receipts"] })

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelOutsourcingReceiptFn({
        data: { outsourcingReceiptId: receipt.id },
      }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const isCancelled = receipt.status === InventoryDocumentStatus.CANCELLED

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
            <CircleX className="size-4" />
            Hủy phiếu
          </Button>
        </PermissionGate>
      )}

      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        In phiếu
      </Button>

      {confirmAction && (
        <Dialog open onOpenChange={closeConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hủy phiếu nhận gia công ngoài</DialogTitle>
              <DialogDescription>
                Bạn chắc chắn muốn hủy phiếu{" "}
                <span className="font-mono font-semibold text-foreground">
                  {receipt.code}
                </span>
                ? Gia công ngoài không quản tồn theo kho nên thao tác này không
                ảnh hưởng số liệu tồn kho.{" "}
                {receipt.requiresIqc &&
                  "Nếu phiếu đã sinh IQC liên kết, thao tác này sẽ thất bại."}
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
