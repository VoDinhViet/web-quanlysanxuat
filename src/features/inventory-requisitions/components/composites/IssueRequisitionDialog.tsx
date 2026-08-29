import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PackageCheck } from "lucide-react"
import type { ReactNode } from "react"

import { ConfirmActionDialog } from "@/components/shared/composites/ConfirmActionDialog"
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
  const queryClient = useQueryClient()
  const issueInventoryRequisitionFn = useServerFn(issueInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      issueInventoryRequisitionFn({ data: { requisitionId: detail.id } }),
  })

  return (
    <ConfirmActionDialog
      trigger={trigger}
      icon={PackageCheck}
      title="Xuất kho phiếu lãnh vật tư này?"
      description={`Phiếu ${detail.code} sẽ được xuất kho — tồn kho sẽ bị trừ, phiếu xuất kho tự sinh, và phiếu không thể chỉnh sửa được nữa sau bước này.`}
      confirmLabel="Xuất kho"
      onConfirm={async () => {
        await mutation.mutateAsync()
        void Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["inventory-requisitions"],
          }),
          queryClient.invalidateQueries({ queryKey: ["inventory-issues"] }),
          queryClient.invalidateQueries({ queryKey: ["inventory-materials"] }),
        ])
      }}
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => {
        if (open) mutation.reset()
      }}
    />
  )
}
