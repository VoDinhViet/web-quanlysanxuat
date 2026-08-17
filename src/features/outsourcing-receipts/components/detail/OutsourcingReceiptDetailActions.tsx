import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck, CircleX, Printer } from "lucide-react"

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
import { postOutsourcingReceipt } from "@/features/outsourcing-receipts/api/server-functions/post-outsourcing-receipt.api"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-receipt.type"
import type { OutsourcingReceiptDetail } from "@/lib/types/outsourcing-receipt.type"

type OutsourcingReceiptDetailActionsProps = {
  detail: OutsourcingReceiptDetail
}

type ConfirmAction = "post" | "cancel" | null

// "Xác nhận đã nhận" (DRAFT → POSTED, cộng tồn kho nhận + sinh IQC nếu requiresIqc) và "Hủy
// phiếu" (chặn nếu đã sinh IQC liên kết — E173) share một dialog xác nhận, cùng khuôn
// InventoryReceiptDetailActions.tsx's ConfirmAction pattern.
export function OutsourcingReceiptDetailActions({
  detail,
}: OutsourcingReceiptDetailActionsProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const queryClient = useQueryClient()
  const postOutsourcingReceiptFn = useServerFn(postOutsourcingReceipt)
  const cancelOutsourcingReceiptFn = useServerFn(cancelOutsourcingReceipt)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["outsourcing-receipts"] })

  const postMutation = useMutation({
    mutationFn: () =>
      postOutsourcingReceiptFn({
        data: { outsourcingReceiptId: detail.id },
      }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelOutsourcingReceiptFn({
        data: { outsourcingReceiptId: detail.id },
      }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const isDraft = detail.status === InventoryDocumentStatus.DRAFT
  const isCancelled = detail.status === InventoryDocumentStatus.CANCELLED

  const activeMutation =
    confirmAction === "post" ? postMutation : cancelMutation

  const closeConfirm = (open: boolean) => {
    if (!open) {
      setConfirmAction(null)
      postMutation.reset()
      cancelMutation.reset()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isDraft && (
        <PermissionGate permission="outsourcing:update">
          <Button type="button" onClick={() => setConfirmAction("post")}>
            <CircleCheck className="size-4" />
            Xác nhận đã nhận
          </Button>
        </PermissionGate>
      )}

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
              <DialogTitle>
                {confirmAction === "post"
                  ? "Xác nhận đã nhận hàng"
                  : "Hủy phiếu nhận gia công ngoài"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "post" ? (
                  <>
                    Xác nhận phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>{" "}
                    sẽ cộng tồn kho nhận theo SL đã khai báo
                    {detail.requiresIqc &&
                      " và tự động sinh phiếu IQC cho lô hàng này"}
                    . Sau khi xác nhận, phiếu không thể sửa được nữa.
                  </>
                ) : detail.status === InventoryDocumentStatus.POSTED ? (
                  <>
                    Phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>{" "}
                    đã được nhập kho — hủy sẽ đảo ngược bút toán và trừ lại tồn
                    kho đã cộng.{" "}
                    {detail.requiresIqc &&
                      "Nếu phiếu đã sinh IQC liên kết, thao tác này sẽ thất bại. "}
                    Nếu vật tư đã được tiêu đi, thao tác cũng sẽ thất bại để
                    tránh tồn âm.
                  </>
                ) : (
                  <>
                    Bạn chắc chắn muốn hủy phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>
                    ? Phiếu chưa cộng tồn kho nên không ảnh hưởng số liệu.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {activeMutation.error && (
              <p className="text-sm text-destructive">
                {activeMutation.error.message}
              </p>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => closeConfirm(false)}
                disabled={activeMutation.isPending}
              >
                Đóng
              </Button>
              <Button
                variant={confirmAction === "cancel" ? "destructive" : "default"}
                onClick={() => {
                  if (confirmAction === "post") {
                    postMutation.mutate()
                  } else {
                    cancelMutation.mutate()
                  }
                }}
                disabled={activeMutation.isPending}
              >
                {activeMutation.isPending ? "Đang xử lý…" : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
