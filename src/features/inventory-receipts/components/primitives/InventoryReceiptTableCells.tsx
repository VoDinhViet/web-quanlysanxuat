import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, Pencil, Printer, Trash2 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
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
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { deleteInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/delete-inventory-receipt.api"
import { InventoryReceiptStatus } from "@/lib/types/inventory-receipt.type"
import type {
  InventoryReceipt,
  InventoryReceiptProductionOrderRef,
  InventoryReceiptPurchaseOrderRef,
  InventoryReceiptPurchaseRequestRef,
} from "@/lib/types/inventory-receipt.type"
import type { ClientRef } from "@/lib/types/client.type"
import type { SupplierRef } from "@/lib/types/supplier.type"

type InventoryReceiptSourceCellProps = {
  purchaseOrder: InventoryReceiptPurchaseOrderRef | null
  supplier: SupplierRef | null
  client: ClientRef | null
  purchaseRequest: InventoryReceiptPurchaseRequestRef | null
  productionOrder: InventoryReceiptProductionOrderRef | null
}

// Ưu tiên hiển thị PO → NCC → Khách hàng → PR → "—". `supplier`/`client` loại trừ lẫn nhau
// (E253) nên không bao giờ cùng có giá trị. `productionOrder` không tham gia hiển thị (phiếu từ
// LSX hiếm khi cũng gắn NCC/PO) nhưng vẫn nhận qua props để chữ ký khớp đủ 5 nguồn gốc có thể có
// trên một phiếu — tránh gọi nhầm thiếu tham số khi thêm cột khác sau này.
export function InventoryReceiptSourceCell({
  purchaseOrder,
  supplier,
  client,
  purchaseRequest,
}: InventoryReceiptSourceCellProps) {
  if (purchaseOrder) {
    return (
      <span className="font-mono text-xs font-semibold text-primary">
        {purchaseOrder.code}
      </span>
    )
  }

  if (supplier) {
    return <span className="text-xs text-foreground">{supplier.name}</span>
  }

  if (client) {
    return <span className="text-xs text-foreground">{client.name}</span>
  }

  if (purchaseRequest) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {purchaseRequest.code}
      </span>
    )
  }

  return <span className="text-xs text-muted-foreground">—</span>
}

type InventoryReceiptActionsCellProps = {
  receipt: InventoryReceipt
}

export function InventoryReceiptActionsCell({
  receipt,
}: InventoryReceiptActionsCellProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteInventoryReceiptFn = useServerFn(deleteInventoryReceipt)

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteInventoryReceiptFn({ data: { receiptId: receipt.id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })
      setDeleteOpen(false)
    },
  })

  const isDraft = receipt.status === InventoryReceiptStatus.DRAFT

  return (
    <>
      <div className="flex items-center justify-center gap-1.5">
        <RoutePermissionGate route="/manage/inventory-receipts/$inventoryReceiptId">
          <Tooltip>
            <TooltipTrigger
              render={
                <LinkButton
                  to="/manage/inventory-receipts/$inventoryReceiptId"
                  params={{ inventoryReceiptId: receipt.id }}
                  variant="outline"
                  size="icon-sm"
                  aria-label="Xem chi tiết phiếu nhập kho"
                  className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                >
                  <Eye className="size-3.5" />
                </LinkButton>
              }
            />
            <TooltipContent>Xem chi tiết</TooltipContent>
          </Tooltip>
        </RoutePermissionGate>

        {isDraft ? (
          <RoutePermissionGate route="/manage/inventory-receipts/$inventoryReceiptId/update">
            <Tooltip>
              <TooltipTrigger
                render={
                  <LinkButton
                    to="/manage/inventory-receipts/$inventoryReceiptId/update"
                    params={{ inventoryReceiptId: receipt.id }}
                    variant="outline"
                    size="icon-sm"
                    aria-label="Chỉnh sửa phiếu"
                    className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                  >
                    <Pencil className="size-3.5" />
                  </LinkButton>
                }
              />
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
          </RoutePermissionGate>
        ) : (
          <DisabledAction
            label="Chỉnh sửa"
            hint="chỉ sửa được khi phiếu ở trạng thái Nháp"
          >
            <Pencil className="size-3.5" />
          </DisabledAction>
        )}

        <DisabledAction label="In phiếu" hint="chưa có tính năng in phiếu">
          <Printer className="size-3.5" />
        </DisabledAction>

        {isDraft ? (
          <PermissionGate permission="inventory:delete">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Xóa phiếu"
                    className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>Xóa phiếu</TooltipContent>
            </Tooltip>
          </PermissionGate>
        ) : (
          <DisabledAction
            label="Xóa phiếu"
            hint="chỉ xóa được khi phiếu ở trạng thái Nháp"
          >
            <Trash2 className="size-3.5" />
          </DisabledAction>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next)
          if (next) deleteMutation.reset()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa phiếu nhập kho</DialogTitle>
            <DialogDescription>
              Bạn chắc chắn muốn xóa phiếu nhập kho{" "}
              <span className="font-mono font-semibold text-foreground">
                {receipt.code}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {deleteMutation.error && (
            <p className="text-sm text-destructive">
              {deleteMutation.error.message}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa…" : "Xóa phiếu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
