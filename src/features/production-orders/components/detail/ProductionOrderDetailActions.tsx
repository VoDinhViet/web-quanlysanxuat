import { CircleCheck, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { ApproveProductionOrderDialog } from "@/features/production-orders/components/detail/ApproveProductionOrderDialog"
import { ProductionOrderStatus } from "@/lib/types/production-order.type"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

type ProductionOrderDetailActionsProps = {
  production: ProductionOrderDetail
  hasUnsavedChanges: boolean
  isSaving: boolean
  onSave: () => void
}

// "Lưu thay đổi" (production:update) và "Duyệt LSX" (production:approve) chỉ còn ý nghĩa khi LSX
// đang PENDING — một khi đã APPROVED, backend từ chối cả PATCH lẫn approve (not_editable /
// invalid_approval_state), nên 2 nút này ẩn hẳn thay vì hiện disabled. "Duyệt LSX" tự khoá (kèm
// tooltip) khi còn thay đổi chưa lưu — approve và lưu là hai quyền khác nhau
// (production:approve vs production:update), nên không thể tự động lưu rồi duyệt trong 1 lượt
// bấm như trước đây. Không có nút "Hủy LSX" — backend không có endpoint hủy và cũng không có kế
// hoạch gần nào cho tính năng này.
export function ProductionOrderDetailActions({
  production,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: ProductionOrderDetailActionsProps) {
  const isPending = production.status === ProductionOrderStatus.PENDING

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isPending ? (
        <PermissionGate permission="production:update">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving || !hasUnsavedChanges}
            onClick={onSave}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Lưu thay đổi
          </Button>
        </PermissionGate>
      ) : null}

      {isPending ? (
        <PermissionGate permission="production:approve">
          {hasUnsavedChanges || isSaving ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    type="button"
                    disabled
                    className="pointer-events-none"
                  >
                    <CircleCheck className="size-4" />
                    Duyệt LSX
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Vui lòng lưu thay đổi trước khi duyệt LSX
              </TooltipContent>
            </Tooltip>
          ) : (
            <ApproveProductionOrderDialog
              production={production}
              trigger={
                <Button type="button">
                  <CircleCheck className="size-4" />
                  Duyệt LSX
                </Button>
              }
            />
          )}
        </PermissionGate>
      ) : null}
    </div>
  )
}
