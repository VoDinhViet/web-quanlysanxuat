import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleX } from "lucide-react"
import type { ReactNode } from "react"

import { ConfirmActionDialog } from "@/components/shared/composites/ConfirmActionDialog"
import { cancelInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/cancel-inventory-requisition.api"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type CancelRequisitionDialogProps = {
  detail: InventoryRequisitionDetail
  trigger: ReactNode
}

// Mọi trạng thái trừ ISSUED/CANCELLED → CANCELLED — điểm cuối, không đảo được. Cùng khuôn
// "Hủy phiếu" của InventoryReceiptDetailActions/InventoryIssueActionsCell.
export function CancelRequisitionDialog({
  detail,
  trigger,
}: CancelRequisitionDialogProps) {
  const queryClient = useQueryClient()
  const cancelInventoryRequisitionFn = useServerFn(cancelInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      cancelInventoryRequisitionFn({ data: { requisitionId: detail.id } }),
  })

  return (
    <ConfirmActionDialog
      trigger={trigger}
      icon={CircleX}
      title="Hủy phiếu lãnh vật tư này?"
      description={`Phiếu ${detail.code} sẽ bị hủy. Hành động này không thể hoàn tác.`}
      confirmLabel="Hủy phiếu"
      cancelLabel="Đóng"
      destructive
      onConfirm={async () => {
        await mutation.mutateAsync()
        void queryClient.invalidateQueries({
          queryKey: ["inventory-requisitions"],
        })
      }}
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => {
        if (open) mutation.reset()
      }}
    />
  )
}
