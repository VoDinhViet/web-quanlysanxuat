import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CloseCircle, Printer } from "@solar-icons/react"
import { SendHorizontal } from "lucide-react"

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
import { mockUpdateInventoryReceiptStatus } from "@/features/inventory-receipts/mock/inventory-receipts.mock"
import { InventoryReceiptPrintDialog } from "@/features/inventory-receipts/components/detail/InventoryReceiptPrintDialog"
import type {
  InventoryReceiptDetail,
  InventoryReceiptStatus,
} from "@/lib/types/inventory-receipt.type"

type InventoryReceiptDetailActionsProps = {
  detail: InventoryReceiptDetail
}

export function InventoryReceiptDetailActions({
  detail,
}: InventoryReceiptDetailActionsProps) {
  const [printOpen, setPrintOpen] = useState(false)
  const [confirmStatus, setConfirmStatus] =
    useState<InventoryReceiptStatus | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (nextStatus: InventoryReceiptStatus) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockUpdateInventoryReceiptStatus(
        detail.id,
        nextStatus,
        "Người dùng hiện tại"
      )
    },
    onSuccess: (updated) => {
      if (!updated) return
      queryClient.setQueryData(
        ["inventory-receipts", "detail", detail.id],
        updated
      )
      void queryClient.invalidateQueries({
        queryKey: ["inventory-receipts", "list"],
      })
      setConfirmStatus(null)
    },
  })

  const isDraft = detail.status === "DRAFT"
  const isAwaitingReceipt = detail.status === "AWAITING_RECEIPT"

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Print button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setPrintOpen(true)}
        >
          <Printer className="size-4" />
          In phiếu
        </Button>

        {/* Action: Send to IQC if Draft */}
        {isDraft && (
          <PermissionGate permission="inventory:update">
            <Button
              type="button"
              onClick={() => setConfirmStatus("AWAITING_IQC")}
              disabled={mutation.isPending}
            >
              <SendHorizontal className="size-4" />
              Gửi kiểm tra IQC
            </Button>
          </PermissionGate>
        )}

        {/* Action: Confirm receipt if Awaiting Receipt */}
        {isAwaitingReceipt && (
          <PermissionGate permission="inventory:update">
            <Button
              type="button"
              onClick={() => setConfirmStatus("RECEIVED")}
              disabled={mutation.isPending}
            >
              <CheckCircle className="size-4" />
              Xác nhận nhập kho
            </Button>
          </PermissionGate>
        )}

        {/* Action: Cancel */}
        {(isDraft || isAwaitingReceipt) && (
          <PermissionGate permission="inventory:update">
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive"
              onClick={() => setConfirmStatus("CANCELLED")}
              disabled={mutation.isPending}
            >
              <CloseCircle className="size-4" />
              Hủy phiếu
            </Button>
          </PermissionGate>
        )}
      </div>

      {/* Print Dialog */}
      <InventoryReceiptPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        receiptId={detail.id}
      />

      {/* Status Confirm Dialog */}
      {confirmStatus && (
        <Dialog
          open={Boolean(confirmStatus)}
          onOpenChange={(open) => !open && setConfirmStatus(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận chuyển trạng thái</DialogTitle>
              <DialogDescription>
                Bạn chắc chắn muốn chuyển phiếu nhập kho{" "}
                <span className="font-mono font-semibold text-foreground">
                  {detail.code}
                </span>{" "}
                sang trạng thái mới?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmStatus(null)}
                disabled={mutation.isPending}
              >
                Đóng
              </Button>
              <Button
                variant={
                  confirmStatus === "CANCELLED" ? "destructive" : "default"
                }
                onClick={() => mutation.mutate(confirmStatus)}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Đang xử lý…" : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
