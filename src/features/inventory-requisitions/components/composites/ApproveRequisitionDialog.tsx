import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck } from "lucide-react"
import type { ReactNode } from "react"

import { ConfirmActionDialog } from "@/components/shared/composites/ConfirmActionDialog"
import { approveInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/approve-inventory-requisition.api"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type ApproveRequisitionDialogProps = {
  detail: InventoryRequisitionDetail
  trigger: ReactNode
}

// PENDING_APPROVAL → APPROVED — chốt giữ hàng (Đã giữ), chưa đụng tồn kho. Backend re-check
// "Có thể lãnh"/SL BOM còn lại ngay tại bước này (E231/E232) vì tồn/BOM có thể đã đổi từ lúc
// lập phiếu tới lúc duyệt — dialog không tự tính trước, chỉ hiện lỗi backend trả về.
export function ApproveRequisitionDialog({
  detail,
  trigger,
}: ApproveRequisitionDialogProps) {
  const queryClient = useQueryClient()
  const approveInventoryRequisitionFn = useServerFn(approveInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      approveInventoryRequisitionFn({ data: { requisitionId: detail.id } }),
  })

  return (
    <ConfirmActionDialog
      trigger={trigger}
      icon={CircleCheck}
      title="Duyệt phiếu lãnh vật tư này?"
      description={`Phiếu ${detail.code} sẽ chuyển sang "Đã duyệt" và giữ số lượng vật tư đã lãnh — chưa trừ tồn kho, chờ kho xuất.`}
      confirmLabel="Duyệt"
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
