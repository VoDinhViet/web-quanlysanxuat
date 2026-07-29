import { Loader2, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { IssueProductionOrderDialog } from "@/features/production-orders/components/detail/IssueProductionOrderDialog"
import { ProductionOrderDecisionStatus } from "@/lib/types/production-order.type"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

type ProductionOrderDetailActionsProps = {
  production: ProductionOrderDetail
  isSaving: boolean
  isIssuing: boolean
  onSave: () => void
  onIssue: () => void
}

// "Lưu nháp" (production:update) và "Duyệt LSX" (production:create) chỉ còn ý nghĩa khi LSX
// đang PENDING — một khi đã ISSUED, backend từ chối cả PATCH lẫn issue (already_issued), nên 2
// nút này ẩn hẳn thay vì hiện disabled. "Hủy LSX" luôn hiện disabled vì backend chưa có
// endpoint hủy — cùng idiom "tính năng sắp có" với OrderDetailActions.tsx.
export function ProductionOrderDetailActions({
  production,
  isSaving,
  isIssuing,
  onSave,
  onIssue,
}: ProductionOrderDetailActionsProps) {
  const isPending = production.status === ProductionOrderDecisionStatus.PENDING

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isPending ? (
        <PermissionGate permission="production:update">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving || isIssuing}
            onClick={onSave}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Lưu nháp
          </Button>
        </PermissionGate>
      ) : null}

      {isPending ? (
        <PermissionGate permission="production:create">
          <IssueProductionOrderDialog
            production={production}
            isIssuing={isIssuing}
            onConfirm={onIssue}
          />
        </PermissionGate>
      ) : null}

      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button
              type="button"
              variant="outline"
              disabled
              className="pointer-events-none border-destructive/30 text-destructive/60"
              aria-label="Hủy LSX"
            >
              <X className="size-4" />
              Hủy LSX
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Tính năng sắp có</TooltipContent>
      </Tooltip>
    </div>
  )
}
