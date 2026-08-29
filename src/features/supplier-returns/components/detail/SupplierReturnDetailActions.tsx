import { useState } from "react"
import { Printer } from "lucide-react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SupplierReturnEvidenceField } from "@/features/supplier-returns/components/detail/SupplierReturnEvidenceField"
import { usePostSupplierReturn } from "@/features/supplier-returns/hooks/use-post-supplier-return"
import { postSupplierReturnSchema } from "@/features/supplier-returns/schemas/post-supplier-return.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { FileFieldValue } from "@/lib/file-field.schema"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

type SupplierReturnDetailActionsProps = {
  detail: SupplierReturnDetail
}

// Header-level actions, same idiom as PurchaseOrderDetailActions.tsx — lives in
// SupplierReturnDetailHeader's action slot rather than a separate sticky footer. "Xác nhận
// xuất" is real (POST /supplier-returns/:id/post — see docs/workflows/supplier-return.md), dialog
// now carries an optional ghi chú/đính kèm form (same idiom as JobOperationReportForm.tsx, just
// without the SL fields); "Hủy phiếu"/"Lưu" stay disabled, the module still has no cancel/edit
// route (B2's deliberate scope cut — undoing a POSTED return needs an "un-complete IQC" path the
// backend doesn't have yet).
export function SupplierReturnDetailActions({
  detail,
}: SupplierReturnDetailActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const postMutation = usePostSupplierReturn({
    supplierReturnId: detail.id,
    onSuccess: () => setConfirmOpen(false),
  })

  const form = useAppForm({
    defaultValues: { note: "", files: [] as FileFieldValue[] },
    validators: { onSubmit: postSupplierReturnSchema },
    onSubmit: ({ value }) => postMutation.mutate(value),
  })

  const isDraft = detail.status === InventoryDocumentStatus.DRAFT

  const closeConfirm = (open: boolean) => {
    setConfirmOpen(open)
    if (!open) {
      postMutation.reset()
      form.reset()
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

          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (form.state.isSubmitting) return
              void form.handleSubmit()
            }}
            noValidate
            className="space-y-4"
          >
            <form.AppField name="note">
              {(field) => (
                <field.TextareaField
                  label="Ghi chú xuất trả (nếu có)"
                  placeholder="Nhập ghi chú (nếu có)"
                  maxLength={500}
                  disabled={postMutation.isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="files">
              {(field) => (
                <SupplierReturnEvidenceField
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={postMutation.isPending}
                />
              )}
            </form.AppField>

            {postMutation.error && (
              <p className="text-sm text-destructive">
                {postMutation.error.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => closeConfirm(false)}
                disabled={postMutation.isPending}
              >
                Đóng
              </Button>
              <Button type="submit" disabled={postMutation.isPending}>
                {postMutation.isPending ? "Đang xử lý…" : "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
