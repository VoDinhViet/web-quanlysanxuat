import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CloseCircle, Printer } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { InventoryReceiptPrintDialog } from "@/features/inventory-receipts/components/detail/InventoryReceiptPrintDialog"
import { postInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/post-inventory-receipt.api"
import { cancelInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/cancel-inventory-receipt.api"
import { InventoryReceiptStatus } from "@/lib/types/inventory-receipt.type"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptDetailActionsProps = {
  detail: InventoryReceiptDetail
}

type ConfirmAction = "post" | "cancel" | null

export function InventoryReceiptDetailActions({
  detail,
}: InventoryReceiptDetailActionsProps) {
  const [printOpen, setPrintOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const queryClient = useQueryClient()
  const postInventoryReceiptFn = useServerFn(postInventoryReceipt)
  const cancelInventoryReceiptFn = useServerFn(cancelInventoryReceipt)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })

  const postMutation = useMutation({
    mutationFn: () =>
      postInventoryReceiptFn({ data: { receiptId: detail.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelInventoryReceiptFn({ data: { receiptId: detail.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const isDraft = detail.status === InventoryReceiptStatus.DRAFT
  const isPosted = detail.status === InventoryReceiptStatus.POSTED
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
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPrintOpen(true)}
        >
          <Printer className="size-4" />
          In phiếu
        </Button>

        {isDraft && (
          <PermissionGate permission="inventory:update">
            <Button type="button" onClick={() => setConfirmAction("post")}>
              <CheckCircle className="size-4" />
              Xác nhận nhập kho
            </Button>
          </PermissionGate>
        )}

        {(isDraft || isPosted) && (
          <PermissionGate permission="inventory:update">
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
      </div>

      <InventoryReceiptPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        detail={detail}
      />

      {confirmAction && (
        <Dialog open onOpenChange={closeConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "post"
                  ? "Xác nhận nhập kho"
                  : "Hủy phiếu nhập kho"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "post" ? (
                  <>
                    Xác nhận phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>{" "}
                    sẽ cộng tồn kho theo các dòng vật tư đã khai báo. Sau khi
                    xác nhận, phiếu không thể sửa được nữa.
                  </>
                ) : isPosted ? (
                  <>
                    Phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>{" "}
                    đã được nhập kho — hủy sẽ đảo ngược bút toán và trừ lại tồn
                    kho đã cộng. Nếu vật tư đã được tiêu đi, thao tác này sẽ
                    thất bại để tránh tồn âm.
                  </>
                ) : (
                  <>
                    Bạn chắc chắn muốn hủy phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>
                    ? Phiếu đang ở trạng thái Nháp nên chưa ảnh hưởng tồn kho.
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
                onClick={() =>
                  confirmAction === "post"
                    ? postMutation.mutate()
                    : cancelMutation.mutate()
                }
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
