import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { InventoryIssueStatusBadge } from "@/features/inventory-issues/components/primitives/InventoryIssueBadges"
import { InventoryIssueSourceCell } from "@/features/inventory-issues/components/primitives/InventoryIssueTableCells"
import { InventoryIssueDetailActions } from "@/features/inventory-issues/components/layouts/InventoryIssueDetailActions"
import { inventoryIssueTypeLabels } from "@/lib/types/inventory-issue.type"
import type { InventoryIssueDetail } from "@/lib/types/inventory-issue.type"

type InventoryIssueDetailHeaderProps = {
  inventoryIssue: InventoryIssueDetail
}

export function InventoryIssueDetailHeader({
  inventoryIssue,
}: InventoryIssueDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            to="/manage/inventory-issues"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách phiếu xuất kho"
          >
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <span className="font-mono text-lg font-bold text-foreground">
            {inventoryIssue.code}
          </span>
          <InventoryIssueStatusBadge status={inventoryIssue.status} />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <MetaField
              label="Đối tượng"
              value={
                <InventoryIssueSourceCell
                  productionOrder={inventoryIssue.productionOrder}
                  productionJob={inventoryIssue.productionJob}
                  department={inventoryIssue.department}
                />
              }
            />
            <MetaField
              label="Loại xuất"
              value={inventoryIssueTypeLabels[inventoryIssue.issueType]}
            />
            <MetaField
              label="Người yêu cầu"
              value={inventoryIssue.requesterBy?.fullName ?? "—"}
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Ngày xuất"
              value={DateTime.fromISO(inventoryIssue.issueDate, {
                zone: "utc",
              }).toFormat("dd/MM/yyyy")}
            />
            <MetaField
              label="Người tạo"
              value={inventoryIssue.creatorBy?.fullName ?? "—"}
            />
            <MetaField
              label="Người xuất kho"
              value={inventoryIssue.posterBy?.fullName ?? "—"}
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Ghi chú"
              value={inventoryIssue.note ?? "Không có ghi chú"}
            />
          </div>
        </div>
      </div>

      <InventoryIssueDetailActions inventoryIssue={inventoryIssue} />
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
