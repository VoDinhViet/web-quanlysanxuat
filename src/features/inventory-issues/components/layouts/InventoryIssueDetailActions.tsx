import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CircleX } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { cancelInventoryIssue } from "@/features/inventory-issues/api/server-functions/cancel-inventory-issue.api"
import { PostInventoryIssueDialog } from "@/features/inventory-issues/components/composites/PostInventoryIssueDialog"
import { InventoryIssueExportActions } from "@/features/inventory-issues/components/layouts/InventoryIssueExportActions"
import {
  InventoryIssueStatus,
  InventoryIssueType,
} from "@/lib/types/inventory-issue.type"
import type { InventoryIssueDetail } from "@/lib/types/inventory-issue.type"

type InventoryIssueDetailActionsProps = {
  inventoryIssue: InventoryIssueDetail
}

// Xuất kho/Hủy phiếu giờ chỉ còn ở đây — bảng danh sách (InventoryIssueTableCells) đổi hẳn sang
// nút "Xem chi tiết" duy nhất, cùng idiom InventoryRequisitionActionsCell. "Xuất kho" mở form
// có ghi chú + ảnh bằng chứng (PostInventoryIssueDialog).
export function InventoryIssueDetailActions({
  inventoryIssue,
}: InventoryIssueDetailActionsProps) {
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const queryClient = useQueryClient()
  const cancelInventoryIssueFn = useServerFn(cancelInventoryIssue)

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelInventoryIssueFn({ data: { issueId: inventoryIssue.id } }),
    onSuccess: async () => {
      setIsCancelOpen(false)
      // Cancelling an issue also cancels the requisition or delivery order it was raised from and
      // frees any stock its draft held.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-issues"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-requisitions"] }),
        queryClient.invalidateQueries({ queryKey: ["outbound-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })

  const isDraft = inventoryIssue.status === InventoryIssueStatus.DRAFT
  const isFromRequisition =
    inventoryIssue.issueType === InventoryIssueType.PRODUCTION
  const isFromOutboundOrder = inventoryIssue.outboundOrder !== null

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isDraft && (
        <PermissionGate permission="inventory:update">
          <PostInventoryIssueDialog
            inventoryIssue={inventoryIssue}
            isFromRequisition={isFromRequisition}
            isFromOutboundOrder={isFromOutboundOrder}
          />
        </PermissionGate>
      )}

      {isDraft && (
        <PermissionGate
          permission={
            isFromOutboundOrder
              ? ["inventory:update", "outbound:update"]
              : "inventory:update"
          }
        >
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive"
            onClick={() => setIsCancelOpen(true)}
          >
            <CircleX className="size-4" />
            Hủy phiếu
          </Button>
        </PermissionGate>
      )}

      <InventoryIssueExportActions issueId={inventoryIssue.id} />

      <AlertDialog
        open={isCancelOpen}
        onOpenChange={(next) => {
          setIsCancelOpen(next)
          if (!next) cancelMutation.reset()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <CircleX />
            </AlertDialogMedia>
            <AlertDialogTitle>Hủy phiếu xuất kho này?</AlertDialogTitle>
            <AlertDialogDescription>
              {`Phiếu "${inventoryIssue.code}" sẽ bị hủy. Hành động này không thể hoàn tác.${isFromRequisition ? " Phiếu lãnh vật tư liên quan cũng sẽ bị hủy theo." : ""}${isFromOutboundOrder ? " Phiếu giao hàng (DO) liên quan cũng sẽ bị hủy theo." : ""}`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {cancelMutation.error && (
            <p className="text-sm text-destructive">
              {cancelMutation.error.message}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
