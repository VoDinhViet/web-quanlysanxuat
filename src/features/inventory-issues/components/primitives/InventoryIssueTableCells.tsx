import { Eye, Printer } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { RowActions } from "@/components/shared/primitives/RowActions"
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

type InventoryIssueJobLsxCellProps = {
  productionOrder: InventoryIssueProductionOrderRef | null
  productionJob: InventoryIssueProductionJobRef | null
}

// Cột "Job / LSX" của danh sách — cùng cách hiển thị với màn Lãnh vật tư
// (InventoryRequisitionsTableColumns): Job đậm, LSX nhỏ bên dưới, "—" khi phiếu không gắn Job/LSX.
export function InventoryIssueJobLsxCell({
  productionOrder,
  productionJob,
}: InventoryIssueJobLsxCellProps) {
  const jobCode = productionJob?.code
  const lsxCode = productionOrder?.code
  if (!jobCode && !lsxCode) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <div className="flex flex-col gap-0.5 font-mono text-xs">
      {jobCode ? (
        <span className="font-semibold text-foreground">{jobCode}</span>
      ) : null}
      {lsxCode ? (
        <span className="text-[11px] text-muted-foreground">{lsxCode}</span>
      ) : null}
    </div>
  )
}

type InventoryIssueActionsCellProps = {
  issue: InventoryIssue
}

// Nút Xem chi tiết chuyển đến trang chi tiết phiếu — Xuất kho/Hủy phiếu chuyển hẳn sang đó
// (InventoryIssueDetailActions), cùng idiom InventoryRequisitionActionsCell.
export function InventoryIssueActionsCell({
  issue,
}: InventoryIssueActionsCellProps) {
  return (
    <RowActions>
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/inventory-issues/$issueId"
              params={{ issueId: issue.id }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="bg-background text-muted-foreground"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>

      <DisabledAction label="In phiếu">
        <Printer className="size-3.5" />
      </DisabledAction>
    </RowActions>
  )
}
