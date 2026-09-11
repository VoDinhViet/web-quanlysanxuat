import { History } from "lucide-react"
import { DateTime } from "luxon"

import { InventoryIssueType } from "@/lib/types/inventory-issue.type"
import type { InventoryIssueDetail } from "@/lib/types/inventory-issue.type"

type InventoryIssueDetailInfoCardProps = {
  inventoryIssue: InventoryIssueDetail
}

// Cùng khuôn InventoryReceiptDetailInfoCard/InventoryRequisitionInfoCard — gộp mốc thời gian thật
// đang có (không dựng timeline giả nhiều bước), xem docs/domains/inventory.md.
export function InventoryIssueDetailInfoCard({
  inventoryIssue,
}: InventoryIssueDetailInfoCardProps) {
  const isFromRequisition =
    inventoryIssue.issueType === InventoryIssueType.PRODUCTION

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <History className="size-4 text-muted-foreground" />
        Nhật ký phiếu
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <InfoRow
          label="Tạo lúc"
          value={`${DateTime.fromISO(inventoryIssue.createdAt).toFormat("dd/MM/yyyy HH:mm")}${inventoryIssue.creatorBy ? ` · ${inventoryIssue.creatorBy.fullName}` : ""}`}
        />

        {inventoryIssue.postedAt && (
          <InfoRow
            label="Xuất kho lúc"
            value={`${DateTime.fromISO(inventoryIssue.postedAt).toFormat("dd/MM/yyyy HH:mm")}${inventoryIssue.posterBy ? ` · ${inventoryIssue.posterBy.fullName}` : ""}`}
          />
        )}

        <InfoRow
          label="Cập nhật lần cuối"
          value={DateTime.fromISO(inventoryIssue.updatedAt).toFormat(
            "dd/MM/yyyy HH:mm"
          )}
        />
      </div>

      {isFromRequisition && (
        <p className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground sm:px-5">
          Phiếu này được tự sinh khi duyệt một phiếu lãnh vật tư — xem{" "}
          <span className="font-mono">docs/domains/inventory.md</span>{" "}
          (be-quanlysanxuat).
        </p>
      )}
    </section>
  )
}

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
