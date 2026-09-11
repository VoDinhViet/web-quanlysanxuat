import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CircleCheck, CircleX, Printer } from "lucide-react"

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
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { cancelInventoryIssue } from "@/features/inventory-issues/api/server-functions/cancel-inventory-issue.api"
import { postInventoryIssue } from "@/features/inventory-issues/api/server-functions/post-inventory-issue.api"
import {
  InventoryIssueStatus,
  InventoryIssueType,
} from "@/lib/types/inventory-issue.type"
import type { InventoryIssueDetail } from "@/lib/types/inventory-issue.type"

type InventoryIssueDetailActionsProps = {
  inventoryIssue: InventoryIssueDetail
}

type ConfirmAction = "post" | "cancel" | null

// Xuất kho/Hủy phiếu giờ chỉ còn ở đây — bảng danh sách (InventoryIssueTableCells) đổi hẳn sang
// nút "Xem chi tiết" duy nhất, cùng idiom InventoryRequisitionActionsCell.
export function InventoryIssueDetailActions({
  inventoryIssue,
}: InventoryIssueDetailActionsProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const queryClient = useQueryClient()
  const postInventoryIssueFn = useServerFn(postInventoryIssue)
  const cancelInventoryIssueFn = useServerFn(cancelInventoryIssue)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["inventory-issues"] })

  const postMutation = useMutation({
    mutationFn: () =>
      postInventoryIssueFn({ data: { issueId: inventoryIssue.id } }),
    onSuccess: async () => {
      setConfirmAction(null)
      await invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelInventoryIssueFn({ data: { issueId: inventoryIssue.id } }),
    onSuccess: async () => {
      setConfirmAction(null)
      await invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  const isDraft = inventoryIssue.status === InventoryIssueStatus.DRAFT
  const isFromRequisition =
    inventoryIssue.issueType === InventoryIssueType.PRODUCTION
  const mutation = confirmAction === "post" ? postMutation : cancelMutation

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isDraft && (
        <PermissionGate permission="inventory:update">
          <Button type="button" onClick={() => setConfirmAction("post")}>
            <CircleCheck className="size-4" />
            Xuất kho
          </Button>
        </PermissionGate>
      )}

      {isDraft && (
        <PermissionGate permission="inventory:update">
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive"
            onClick={() => setConfirmAction("cancel")}
          >
            <CircleX className="size-4" />
            Hủy phiếu
          </Button>
        </PermissionGate>
      )}

      <PendingAction label="In" hint="chưa hỗ trợ in phiếu">
        <Printer className="size-4" />
        In
      </PendingAction>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmAction(null)
            postMutation.reset()
            cancelMutation.reset()
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              {confirmAction === "post" ? <CircleCheck /> : <CircleX />}
            </AlertDialogMedia>
            <AlertDialogTitle>
              {confirmAction === "post"
                ? "Xuất kho phiếu này?"
                : "Hủy phiếu xuất kho này?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "post"
                ? `Phiếu "${inventoryIssue.code}" sẽ được xuất kho — tồn kho sẽ bị trừ và phiếu không thể chỉnh sửa sau đó.${isFromRequisition ? " Phiếu lãnh vật tư liên quan sẽ chuyển sang Đã xuất." : ""}`
                : `Phiếu "${inventoryIssue.code}" sẽ bị hủy. Hành động này không thể hoàn tác.${isFromRequisition ? " Phiếu lãnh vật tư liên quan cũng sẽ bị hủy theo." : ""}`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {mutation.error ? (
            <p className="text-sm text-destructive">{mutation.error.message}</p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              variant={confirmAction === "post" ? "default" : "destructive"}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending
                ? "Đang xử lý..."
                : confirmAction === "post"
                  ? "Xuất kho"
                  : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
