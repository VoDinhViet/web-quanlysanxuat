import { DateTime } from "luxon"
import {
  Building2,
  Calendar,
  ClipboardCheck,
  FileText,
  Info,
  StickyNote,
  User,
  Warehouse,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { OutsourcingReceiptDetailSectionCard } from "@/features/outsourcing-receipts/components/detail/OutsourcingReceiptDetailSectionCard"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-receipt.type"
import type { OutsourcingReceiptDetail } from "@/lib/types/outsourcing-receipt.type"

type OutsourcingReceiptInfoCardProps = {
  detail: OutsourcingReceiptDetail
}

// Gộp toàn bộ tham chiếu vào 1 card (khuôn InfoTile của IqcGeneralInfoCard.tsx) — module này chỉ
// có 1 dòng vật tư mỗi phiếu nên không cần bảng dòng riêng như inventory-receipts. Mã OS-OUT hiện
// dạng text thường (không phải <Link>) vì OS-OUT chưa có route chi tiết `$id`.
export function OutsourcingReceiptInfoCard({
  detail,
}: OutsourcingReceiptInfoCardProps) {
  const isPosted = detail.status === InventoryDocumentStatus.POSTED

  return (
    <OutsourcingReceiptDetailSectionCard
      icon={Info}
      title="Thông tin phiếu"
      description="Nguồn gốc, kho nhận và trạng thái xác nhận"
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <InfoTile
          icon={FileText}
          label="Mã phiếu gửi (OS-OUT)"
          value={
            <span className="font-mono">{detail.outsourcingOrder.code}</span>
          }
        />
        <InfoTile
          icon={Building2}
          label="Nhà cung cấp"
          value={detail.supplier.name}
        />
        <InfoTile
          icon={Warehouse}
          label="Kho nhận"
          value={detail.warehouse.name}
        />
        <InfoTile
          icon={ClipboardCheck}
          label="Yêu cầu QC"
          value={
            detail.requiresIqc
              ? isPosted
                ? "Có — đã sinh phiếu IQC, xem trong danh sách IQC"
                : "Có — sẽ sinh phiếu IQC khi xác nhận đã nhận"
              : "Không"
          }
        />
        <InfoTile
          icon={StickyNote}
          label="Ghi chú"
          value={detail.note ?? "—"}
        />
        <InfoTile
          icon={User}
          label="Người tạo"
          value={detail.creatorBy?.fullName ?? "—"}
        />
        {isPosted && (
          <>
            <InfoTile
              icon={User}
              label="Người xác nhận"
              value={detail.posterBy?.fullName ?? "—"}
            />
            <InfoTile
              icon={Calendar}
              label="Ngày xác nhận"
              value={
                detail.postedAt
                  ? DateTime.fromISO(detail.postedAt).toFormat(
                      "dd/MM/yyyy HH:mm"
                    )
                  : "—"
              }
            />
          </>
        )}
      </dl>
    </OutsourcingReceiptDetailSectionCard>
  )
}

type InfoTileProps = {
  icon: LucideIcon
  label: string
  value: ReactNode
}

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
