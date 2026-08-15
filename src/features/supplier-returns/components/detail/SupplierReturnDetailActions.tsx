import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Printer } from "lucide-react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { PendingAction } from "@/components/shared/PendingAction"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { postSupplierReturn } from "@/features/supplier-returns/api/server-functions/post-supplier-return.api"
import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

type SupplierReturnDetailActionsProps = {
  detail: SupplierReturnDetail
}

// Header-level actions, same idiom as PurchaseOrderDetailActions.tsx — lives in
// SupplierReturnDetailHeader's action slot rather than a separate sticky footer. "Xác nhận
// xuất" is real (POST /supplier-returns/:id/post — see docs/workflows/supplier-return.md);
// "Hủy phiếu"/"Lưu" stay disabled, the module still has no cancel/edit route (B2's deliberate
// scope cut — undoing a POSTED return needs an "un-complete IQC" path the backend doesn't have
// yet).
export function SupplierReturnDetailActions({
  detail,
}: SupplierReturnDetailActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const queryClient = useQueryClient()
  const postSupplierReturnFn = useServerFn(postSupplierReturn)

  const postMutation = useMutation({
    mutationFn: () =>
      postSupplierReturnFn({ data: { supplierReturnId: detail.id } }),
    onSuccess: async () => {
      // IQC liên kết đổi trạng thái (WAITING_RETURN → COMPLETED) trong cùng thao tác — invalidate
      // cả 2 cache.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["supplier-returns"] }),
        queryClient.invalidateQueries({ queryKey: ["iqc"] }),
      ])
      setConfirmOpen(false)
    },
  })

  const isDraft = detail.status === InventoryDocumentStatus.DRAFT

  const closeConfirm = (open: boolean) => {
    setConfirmOpen(open)
    if (!open) {
      postMutation.reset()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <PendingAction
        label="Hủy phiếu"
        hint="chưa có API hủy phiếu"
        variant="destructive"
      >
        Hủy phiếu
      </PendingAction>
      <PendingAction label="Lưu" hint="chưa có API lưu chỉnh sửa">
        Lưu
      </PendingAction>

      {isDraft && (
        <PermissionGate permission="inventory:update">
          <Button type="button" onClick={() => setConfirmOpen(true)}>
            Xác nhận xuất
          </Button>
        </PermissionGate>
      )}

      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        In phiếu
      </Button>

      <Dialog open={confirmOpen} onOpenChange={closeConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xuất trả NCC</DialogTitle>
            <DialogDescription>
              Xác nhận phiếu{" "}
              <span className="font-mono font-semibold text-foreground">
                {detail.code}
              </span>{" "}
              sẽ trừ tồn kho (nếu phiếu nhập kho liên quan đã nhập kho) và tự
              động hoàn tất phiếu IQC liên kết. Sau khi xác nhận, phiếu không
              thể sửa được nữa.
            </DialogDescription>
          </DialogHeader>

          {postMutation.error && (
            <p className="text-sm text-destructive">
              {postMutation.error.message}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => closeConfirm(false)}
              disabled={postMutation.isPending}
            >
              Đóng
            </Button>
            <Button
              onClick={() => postMutation.mutate()}
              disabled={postMutation.isPending}
            >
              {postMutation.isPending ? "Đang xử lý…" : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
