import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, MoreVertical, Pencil, Printer, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { InventoryReceiptDetailPrintDialog } from "@/features/inventory-receipts/components/detail/InventoryReceiptDetailPrintDialog"
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
  const [printOpen, setPrintOpen] = useState(false)
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
      <div className="flex items-center justify-center gap-1">
        {/* Eye icon: Quick view link */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-primary"
          title="Xem chi tiết phiếu nhập kho"
          asChild
        >
          <Link
            to="/manage/inventory-receipts/$inventoryReceiptId"
            params={{ inventoryReceiptId: receipt.id }}
          >
            <Eye className="size-4" />
          </Link>
        </Button>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              aria-label="Thao tác khác"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                to="/manage/inventory-receipts/$inventoryReceiptId"
                params={{ inventoryReceiptId: receipt.id }}
              >
                <Eye className="mr-2 size-4" />
                Xem chi tiết
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setPrintOpen(true)}>
              <Printer className="mr-2 size-4" />
              In phiếu nhập kho
            </DropdownMenuItem>

            {isDraft && (
              <>
                <DropdownMenuSeparator />
                <RoutePermissionGate route="/manage/inventory-receipts/$inventoryReceiptId/update">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/manage/inventory-receipts/$inventoryReceiptId/update"
                      params={{ inventoryReceiptId: receipt.id }}
                    >
                      <Pencil className="mr-2 size-4 text-amber-600" />
                      Chỉnh sửa phiếu
                    </Link>
                  </DropdownMenuItem>
                </RoutePermissionGate>
                <PermissionGate permission="inventory:delete">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Xóa phiếu
                  </DropdownMenuItem>
                </PermissionGate>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Print Dialog */}
      <InventoryReceiptDetailPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        detail={receipt}
      />

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
