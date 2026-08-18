import { DateTime } from "luxon"
import {
  Building2,
  Calendar,
  ClipboardCheck,
  Info,
  StickyNote,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { OutsourcingReceiptDetailSectionCard } from "@/features/outsourcing-receipts/components/detail/OutsourcingReceiptDetailSectionCard"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-receipt.type"
import type { OutsourcingReceiptDetail } from "@/lib/types/outsourcing-receipt.type"

type OutsourcingReceiptInfoCardProps = {
  receipt: OutsourcingReceiptDetail
}

// Gộp toàn bộ tham chiếu vào 1 card (khuôn InfoTile của IqcGeneralInfoCard.tsx). Không có tile
// "Mã phiếu gửi (OS-OUT)" — mỗi dòng của phiếu giờ có thể trỏ tới một OS-OUT khác nhau (không còn
// 1-1 ở cấp phiếu), xem OutsourcingReceiptItemsCard.tsx cho mã OS-OUT theo từng dòng.
export function OutsourcingReceiptInfoCard({
  receipt,
}: OutsourcingReceiptInfoCardProps) {
  const isPosted = receipt.status === InventoryDocumentStatus.POSTED

  return (
    <OutsourcingReceiptDetailSectionCard
      icon={Info}
      title="Thông tin phiếu"
      description="Nguồn gốc và trạng thái xác nhận"
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <InfoTile
          icon={Building2}
          label="Nhà cung cấp"
          value={receipt.supplier.name}
        />
        <InfoTile
          icon={ClipboardCheck}
          label="Yêu cầu QC"
          value={
            receipt.requiresIqc
              ? isPosted
                ? "Có — đã sinh phiếu IQC, xem trong danh sách IQC"
                : "Có — sẽ sinh phiếu IQC khi xác nhận đã nhận"
              : "Không"
          }
        />
        <InfoTile
          icon={StickyNote}
          label="Ghi chú"
          value={receipt.note ?? "—"}
        />
        <InfoTile
          icon={User}
          label="Người tạo"
          value={receipt.creatorBy?.fullName ?? "—"}
        />
        {isPosted && (
          <>
            <InfoTile
              icon={User}
              label="Người xác nhận"
              value={receipt.posterBy?.fullName ?? "—"}
            />
            <InfoTile
              icon={Calendar}
              label="Ngày xác nhận"
              value={
                receipt.postedAt
                  ? DateTime.fromISO(receipt.postedAt).toFormat(
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
