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
import { IconButton } from "@/components/shared/buttons/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { InventoryIssuePrintDialog } from "@/features/inventory-issues/components/InventoryIssuePrintDialog"
import { cancelInventoryIssue } from "@/features/inventory-issues/api/server-functions/cancel-inventory-issue.api"
import { postInventoryIssue } from "@/features/inventory-issues/api/server-functions/post-inventory-issue.api"
import { InventoryIssueStatus } from "@/lib/types/inventory-issue.type"
import type {
  InventoryIssue,
  InventoryIssueDepartmentRef,
  InventoryIssueProductionJobRef,
  InventoryIssueProductionOrderRef,
} from "@/lib/types/inventory-issue.type"

type InventoryIssueSourceCellProps = {
  productionOrder: InventoryIssueProductionOrderRef | null
  productionJob: InventoryIssueProductionJobRef | null
  department: InventoryIssueDepartmentRef | null
}

// Ưu tiên hiển thị LSX → Job → Bộ phận → "—", cùng idiom với
// InventoryReceiptSourceCell (ưu tiên PO → NCC → PR → "—").
export function InventoryIssueSourceCell({
  productionOrder,
  productionJob,
  department,
}: InventoryIssueSourceCellProps) {
  if (productionOrder?.code) {
    return (
      <span className="font-mono text-xs font-semibold text-primary">
        {productionOrder.code}
      </span>
    )
  }

  if (productionJob?.code) {
    return (
      <span className="font-mono text-xs text-foreground">
        {productionJob.code}
      </span>
    )
  }

  if (department) {
    return <span className="text-xs text-foreground">{department.name}</span>
  }

  return <span className="text-xs text-muted-foreground">—</span>
}

type ConfirmAction = "post" | "cancel" | null

type InventoryIssueActionsCellProps = {
  issue: InventoryIssue
}

// Ba nút thao tác trực tiếp (không gộp dropdown) — không có thao tác nào là "chính" ở đây,
// cùng idiom với ClientsTableColumns thay vì InventoryReceiptActionsCell (Eye + Dropdown).
// Xuất kho/Hủy phiếu dùng chung một AlertDialog, đổi nội dung theo confirmAction đang chọn —
// cùng idiom với InventoryReceiptDetailActions' ConfirmAction state.
export function InventoryIssueActionsCell({
  issue,
}: InventoryIssueActionsCellProps) {
  const [printOpen, setPrintOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const queryClient = useQueryClient()
  const postInventoryIssueFn = useServerFn(postInventoryIssue)
  const cancelInventoryIssueFn = useServerFn(cancelInventoryIssue)

  const postMutation = useMutation({
    mutationFn: () => postInventoryIssueFn({ data: { issueId: issue.id } }),
    onSuccess: async () => {
      setConfirmAction(null)
      await queryClient.invalidateQueries({ queryKey: ["inventory-issues"] })
    },
    onError: (error) => toast.error(error.message),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelInventoryIssueFn({ data: { issueId: issue.id } }),
    onSuccess: async () => {
      setConfirmAction(null)
      await queryClient.invalidateQueries({ queryKey: ["inventory-issues"] })
    },
    onError: (error) => toast.error(error.message),
  })

  const isDraft = issue.status === InventoryIssueStatus.DRAFT
  const isCancelled = issue.status === InventoryIssueStatus.CANCELLED
  const mutation = confirmAction === "post" ? postMutation : cancelMutation

  return (
    <>
      <div className="flex items-center justify-center gap-1.5">
        <IconButton
          label="In phiếu"
          className="text-muted-foreground hover:border-primary/30 hover:text-primary"
          onClick={() => setPrintOpen(true)}
        >
          <Printer className="size-3.5" />
        </IconButton>

        {isDraft && (
          <PermissionGate permission="inventory:update">
            <IconButton
              label="Xuất kho"
              className="text-muted-foreground hover:border-success/30 hover:text-success"
              onClick={() => setConfirmAction("post")}
            >
              <CircleCheck className="size-3.5" />
            </IconButton>
          </PermissionGate>
        )}

        {!isCancelled && (
          <PermissionGate permission="inventory:update">
            <IconButton
              label="Hủy phiếu"
              className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
              onClick={() => setConfirmAction("cancel")}
            >
              <CircleX className="size-3.5" />
            </IconButton>
          </PermissionGate>
        )}
      </div>

      <InventoryIssuePrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        detail={issue}
      />

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
                ? `Phiếu "${issue.code}" sẽ được xuất kho — tồn kho sẽ bị trừ và phiếu không thể chỉnh sửa sau đó.`
                : `Phiếu "${issue.code}" sẽ bị hủy. Hành động này không thể hoàn tác.`}
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
              onClick={(event) => {
                event.preventDefault()
                mutation.mutate()
              }}
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
    </>
  )
}
