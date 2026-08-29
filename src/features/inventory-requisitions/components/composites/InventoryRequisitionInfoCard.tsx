import { History } from "lucide-react"
import { DateTime } from "luxon"

import { SectionCard } from "@/components/shared/layouts/SectionCard"
import { InfoRow } from "@/components/shared/primitives/InfoFields"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type InventoryRequisitionInfoCardProps = {
  detail: InventoryRequisitionDetail
}

// Nhật ký các mốc thời gian thật (gửi/duyệt/từ chối/xuất) — không dựng timeline node-graph giả
// nhiều bước, vì lifecycle có nhánh gửi-lại (REJECTED → gửi lại → PENDING_APPROVAL) làm mốc cũ
// (sentAt/rejectedAt) dễ trở nên không đại diện cho "bước hiện tại" nếu suy diễn từ chúng — cùng
// lý do InventoryReceiptInfoCard.tsx chọn hiện timestamp thật thay vì dựng timeline.
export function InventoryRequisitionInfoCard({
  detail,
}: InventoryRequisitionInfoCardProps) {
  return (
    <SectionCard
      icon={History}
      title="Nhật ký phiếu"
      contentClassName="flex flex-col gap-3 px-4 py-3.5 sm:px-5"
    >
      <InfoRow
        label="Tạo lúc"
        value={`${DateTime.fromISO(detail.createdAt).toFormat("dd/MM/yyyy HH:mm")}${detail.creatorBy ? ` · ${detail.creatorBy.fullName}` : ""}`}
      />

      {detail.sentAt && (
        <InfoRow
          label="Gửi duyệt lúc"
          value={`${DateTime.fromISO(detail.sentAt).toFormat("dd/MM/yyyy HH:mm")}${detail.senderBy ? ` · ${detail.senderBy.fullName}` : ""}`}
        />
      )}

      {detail.approvedAt && (
        <InfoRow
          label="Duyệt lúc"
          value={`${DateTime.fromISO(detail.approvedAt).toFormat("dd/MM/yyyy HH:mm")}${detail.approverBy ? ` · ${detail.approverBy.fullName}` : ""}`}
        />
      )}

      {detail.rejectedAt && (
        <>
          <InfoRow
            label="Từ chối lúc"
            value={`${DateTime.fromISO(detail.rejectedAt).toFormat("dd/MM/yyyy HH:mm")}${detail.rejecterBy ? ` · ${detail.rejecterBy.fullName}` : ""}`}
          />
          {detail.rejectionReason && (
            <InfoRow label="Lý do từ chối" value={detail.rejectionReason} />
          )}
        </>
      )}

      {detail.issuedAt && (
        <InfoRow
          label="Xuất kho lúc"
          value={`${DateTime.fromISO(detail.issuedAt).toFormat("dd/MM/yyyy HH:mm")}${detail.issuerBy ? ` · ${detail.issuerBy.fullName}` : ""}`}
        />
      )}

      {detail.inventoryIssue && (
        <InfoRow
          label="Phiếu xuất kho"
          value={
            <span className="font-mono">{detail.inventoryIssue.code}</span>
          }
        />
      )}

      <InfoRow
        label="Cập nhật lần cuối"
        value={DateTime.fromISO(detail.updatedAt).toFormat("dd/MM/yyyy HH:mm")}
      />
    </SectionCard>
  )
}
