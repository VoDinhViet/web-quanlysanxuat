import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { PackageCheck } from "lucide-react"
import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { issueInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/issue-inventory-requisition.api"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type IssueRequisitionDialogProps = {
  detail: InventoryRequisitionDetail
  trigger: ReactNode
}

// APPROVED → ISSUED (điểm cuối) — tự sinh phiếu xuất kho POSTED + trừ tồn thật, không thể sửa
// phiếu sau bước này. Invalidate thêm inventory-issues (phiếu xuất kho mới sinh) và
// inventory-materials (tồn kho vừa đổi), cùng khuôn SupplierReturnDetailActions's multi-invalidate.
export function IssueRequisitionDialog({
  detail,
  trigger,
}: IssueRequisitionDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const issueInventoryRequisitionFn = useServerFn(issueInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      issueInventoryRequisitionFn({ data: { requisitionId: detail.id } }),
    onSuccess: async () => {
      setOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["inventory-requisitions"],
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory-issues"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-materials"] }),
      ])
    },
  })

  return (
    <AlertDialogTrigger
      isOpen={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) mutation.reset()
      }}
    >
      {trigger}
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <PackageCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>Xuất kho phiếu lãnh vật tư này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${detail.code} sẽ được xuất kho — tồn kho sẽ bị trừ, phiếu xuất kho tự sinh, và phiếu không thể chỉnh sửa được nữa sau bước này.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            isDisabled={mutation.isPending}
            onPress={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xuất kho"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
