import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AltArrowDown,
  CheckCircle,
  CloseCircle,
  DocumentText,
  FileDownload,
  Printer,
} from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { cancelInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/cancel-inventory-receipt.api"
import { confirmInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/confirm-inventory-receipt.api"
import { exportInventoryReceiptPdf } from "@/features/inventory-receipts/api/server-functions/export-inventory-receipt-pdf.api"
import { postInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/post-inventory-receipt.api"
import {
  downloadBase64File,
  PDF_MIME_TYPE,
  printBase64Pdf,
} from "@/lib/download-file"
import { InventoryReceiptStatus } from "@/lib/types/inventory-receipt.type"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptDetailActionsProps = {
  inventoryReceipt: InventoryReceiptDetail
}

type ConfirmAction = "confirm" | "post" | "cancel" | null

export function InventoryReceiptDetailActions({
  inventoryReceipt,
}: InventoryReceiptDetailActionsProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const queryClient = useQueryClient()
  const confirmInventoryReceiptFn = useServerFn(confirmInventoryReceipt)
  const postInventoryReceiptFn = useServerFn(postInventoryReceipt)
  const cancelInventoryReceiptFn = useServerFn(cancelInventoryReceipt)

  const exportInventoryReceiptPdfFn = useServerFn(exportInventoryReceiptPdf)

  const { mutateAsync: fetchPdf, isPending: isFetchingPdf } = useMutation({
    mutationFn: () =>
      exportInventoryReceiptPdfFn({ data: { receiptId: inventoryReceipt.id } }),
  })

  const handlePrint = () => {
    toast.promise(
      fetchPdf().then(({ base64 }) => {
        printBase64Pdf(base64)
      }),
      {
        loading: "Đang tải dữ liệu in...",
        success: "Đã mở bản in phiếu nhập kho",
        error: (error) => error.message || "In thất bại",
      }
    )
  }

  const handleExportPdf = () => {
    toast.promise(
      fetchPdf().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, PDF_MIME_TYPE)
      }),
      {
        loading: "Đang tạo phiếu nhập kho...",
        success: "Đã xuất phiếu nhập kho",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })

  const confirmMutation = useMutation({
    mutationFn: () =>
      confirmInventoryReceiptFn({ data: { receiptId: inventoryReceipt.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const postMutation = useMutation({
    mutationFn: () =>
      postInventoryReceiptFn({ data: { receiptId: inventoryReceipt.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelInventoryReceiptFn({ data: { receiptId: inventoryReceipt.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const isDraft = inventoryReceipt.status === InventoryReceiptStatus.DRAFT
  const isPendingIqc =
    inventoryReceipt.status === InventoryReceiptStatus.PENDING_IQC
  const isPosted = inventoryReceipt.status === InventoryReceiptStatus.POSTED
  const isCancelled =
    inventoryReceipt.status === InventoryReceiptStatus.CANCELLED
  // `post` accepts both PENDING_RECEIPT and PENDING_IQC (backend re-checks IQC completion itself,
  // E153 if not done yet) — same button for both, no local IQC-completion lookup needed.
  const canPost =
    inventoryReceipt.status === InventoryReceiptStatus.PENDING_RECEIPT ||
    isPendingIqc

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
        <PermissionGate permission="inventory:read">
          <Button
            type="button"
            variant="outline"
            disabled={isFetchingPdf}
            onClick={handlePrint}
          >
            {isFetchingPdf ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Printer className="size-4" />
            )}
            In
          </Button>
        </PermissionGate>

        <PermissionGate permission="inventory:read">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFetchingPdf}
                >
                  <FileDownload className="size-4" />
                  <span>Xuất</span>
                  <AltArrowDown className="size-3.5 opacity-60" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-60 p-1.5">
              <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                Tùy chọn xuất dữ liệu
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                disabled={isFetchingPdf}
                onClick={handleExportPdf}
                className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
              >
                <DocumentText className="mt-0.5 size-4 shrink-0 text-rose-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    Phiếu nhập kho
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    File tài liệu PDF
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PermissionGate>

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
                      {inventoryReceipt.code}
                    </span>{" "}
                    — nếu phiếu yêu cầu QC sẽ chuyển sang chờ kiểm tra chất
                    lượng (IQC), ngược lại chuyển thẳng sang chờ nhập kho. Chưa
                    cộng tồn kho ở bước này.
                  </>
                ) : confirmAction === "post" ? (
                  <>
                    Xác nhận phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {inventoryReceipt.code}
                    </span>{" "}
                    sẽ cộng tồn kho theo các dòng vật tư đã khai báo. Sau khi
                    xác nhận, phiếu không thể sửa được nữa.
                  </>
                ) : isPosted ? (
                  <>
                    Phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {inventoryReceipt.code}
                    </span>{" "}
                    đã được nhập kho — hủy sẽ đảo ngược bút toán và trừ lại tồn
                    kho đã cộng. Nếu vật tư đã được tiêu đi, thao tác này sẽ
                    thất bại để tránh tồn âm.
                  </>
                ) : (
                  <>
                    Bạn chắc chắn muốn hủy phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {inventoryReceipt.code}
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
