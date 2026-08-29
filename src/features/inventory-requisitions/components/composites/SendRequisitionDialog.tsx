import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Send } from "lucide-react"
import type { ReactNode } from "react"

import { ConfirmActionDialog } from "@/components/shared/composites/ConfirmActionDialog"
import { sendInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/send-inventory-requisition.api"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type SendRequisitionDialogProps = {
  detail: InventoryRequisitionDetail
  trigger: ReactNode
}

// DRAFT/REJECTED → PENDING_APPROVAL — cùng khuôn SendQuotationDialog.tsx.
export function SendRequisitionDialog({
  detail,
  trigger,
}: SendRequisitionDialogProps) {
  const queryClient = useQueryClient()
  const sendInventoryRequisitionFn = useServerFn(sendInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      sendInventoryRequisitionFn({ data: { requisitionId: detail.id } }),
  })

  return (
    <ConfirmActionDialog
      trigger={trigger}
      icon={Send}
      title="Gửi duyệt phiếu lãnh vật tư này?"
      description={`Phiếu ${detail.code} sẽ chuyển sang trạng thái "Chờ duyệt" và không sửa được nữa cho tới khi có quyết định.`}
      confirmLabel="Gửi duyệt"
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
