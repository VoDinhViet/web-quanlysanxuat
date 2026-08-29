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
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { InventoryReceiptDetailPrintDialog } from "@/features/inventory-receipts/components/composites/InventoryReceiptDetailPrintDialog"
import { cancelInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/cancel-inventory-receipt.api"
import { confirmInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/confirm-inventory-receipt.api"
import { postInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/post-inventory-receipt.api"
import { InventoryReceiptStatus } from "@/lib/types/inventory-receipt.type"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptDetailActionsProps = {
  detail: InventoryReceiptDetail
}

type ConfirmAction = "confirm" | "post" | "cancel" | null

export function InventoryReceiptDetailActions({
  detail,
}: InventoryReceiptDetailActionsProps) {
  const [printOpen, setPrintOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const queryClient = useQueryClient()
  const confirmInventoryReceiptFn = useServerFn(confirmInventoryReceipt)
  const postInventoryReceiptFn = useServerFn(postInventoryReceipt)
  const cancelInventoryReceiptFn = useServerFn(cancelInventoryReceipt)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })

  const confirmMutation = useMutation({
    mutationFn: () =>
      confirmInventoryReceiptFn({ data: { receiptId: detail.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

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
  const isPendingIqc = detail.status === InventoryReceiptStatus.PENDING_IQC
  const isPosted = detail.status === InventoryReceiptStatus.POSTED
  const isCancelled = detail.status === InventoryReceiptStatus.CANCELLED
  // `post` accepts both PENDING_RECEIPT and PENDING_IQC (backend re-checks IQC completion itself,
  // E153 if not done yet) — same button for both, no local IQC-completion lookup needed.
  const canPost =
    detail.status === InventoryReceiptStatus.PENDING_RECEIPT || isPendingIqc

  const activeMutation =
    confirmAction === "confirm"
      ? confirmMutation
      : confirmAction === "post"
        ? postMutation
        : cancelMutation

  const closeConfirm = (open: boolean) => {
    if (!open) {
      setConfirmAction(null)
      confirmMutation.reset()
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
            <Button type="button" onClick={() => setConfirmAction("confirm")}>
              <CheckCircle className="size-4" />
              Xác nhận
            </Button>
          </PermissionGate>
        )}

        {canPost && (
          <PermissionGate permission="inventory:update">
            <Button type="button" onClick={() => setConfirmAction("post")}>
              <CheckCircle className="size-4" />
              Xác nhận nhập kho
            </Button>
          </PermissionGate>
        )}

        {!isCancelled && (
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

      {isPendingIqc && (
        <p className="max-w-64 text-right text-[11px] text-muted-foreground">
          Chỉ nhập kho được sau khi mọi phiếu IQC của phiếu này đã hoàn tất.
        </p>
      )}

      <InventoryReceiptDetailPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        detail={detail}
      />

      {confirmAction && (
        <Dialog open onOpenChange={closeConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "confirm"
                  ? "Xác nhận phiếu nhập kho"
                  : confirmAction === "post"
                    ? "Xác nhận nhập kho"
                    : "Hủy phiếu nhập kho"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "confirm" ? (
                  <>
                    Xác nhận phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>{" "}
                    — nếu phiếu yêu cầu QC sẽ chuyển sang chờ kiểm tra chất
                    lượng (IQC), ngược lại chuyển thẳng sang chờ nhập kho. Chưa
                    cộng tồn kho ở bước này.
                  </>
                ) : confirmAction === "post" ? (
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
                  if (confirmAction === "confirm") {
                    confirmMutation.mutate()
                  } else if (confirmAction === "post") {
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
