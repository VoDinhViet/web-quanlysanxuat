import { useState } from "react"
import { Link } from "@tanstack/react-router"
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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { mockDeleteInventoryReceipt } from "@/features/inventory-receipts/mock/inventory-receipts.mock"
import { InventoryReceiptPrintDialog } from "@/features/inventory-receipts/components/detail/InventoryReceiptPrintDialog"
import type { InventoryReceipt } from "@/lib/types/inventory-receipt.type"

export function InventoryReceiptActionsCell({
  receipt,
}: {
  receipt: InventoryReceipt
}) {
  const [printOpen, setPrintOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return mockDeleteInventoryReceipt(receipt.id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["inventory-receipts", "list"],
      })
      setDeleteOpen(false)
    },
  })

  const isDraft = receipt.status === "DRAFT"

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

            {/* Added Print Feature per mockup annotation */}
            <DropdownMenuItem onClick={() => setPrintOpen(true)}>
              <Printer className="mr-2 size-4" />
              In phiếu nhập kho
            </DropdownMenuItem>

            {isDraft && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/manage/inventory-receipts/$inventoryReceiptId"
                    params={{ inventoryReceiptId: receipt.id }}
                  >
                    <Pencil className="mr-2 size-4 text-amber-600" />
                    Chỉnh sửa phiếu
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Xóa phiếu
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Print Dialog */}
      <InventoryReceiptPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        receiptId={receipt.id}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
