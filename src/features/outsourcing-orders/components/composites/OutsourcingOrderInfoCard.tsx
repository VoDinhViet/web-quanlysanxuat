import { DateTime } from "luxon"
import { Calendar, Info, StickyNote, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { OutsourcingOrderDetailSectionCard } from "@/features/outsourcing-orders/components/layouts/OutsourcingOrderDetailSectionCard"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderInfoCardProps = {
  order: OutsourcingOrderDetail
}

// Ghi chú + người tạo + người duyệt + người/ngày xác nhận xuất. Người duyệt và xác nhận xuất chỉ có
// từ khi phiếu đi qua các bước đó nên hiện "—" ở phiếu nháp. NCC/ngày đã có ở header's meta grid nên
// không lặp lại ở đây.
export function OutsourcingOrderInfoCard({
  order,
}: OutsourcingOrderInfoCardProps) {
  return (
    <OutsourcingOrderDetailSectionCard
      icon={Info}
      title="Thông tin phiếu"
      description="Ghi chú, người duyệt và xác nhận xuất"
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <InfoTile icon={StickyNote} label="Ghi chú" value={order.note ?? "—"} />
        <InfoTile
          icon={User}
          label="Người tạo"
          value={order.creatorBy?.fullName ?? "—"}
        />
        <InfoTile
          icon={User}
          label="Người duyệt"
          value={order.approverBy?.fullName ?? "—"}
        />
        <InfoTile
          icon={Calendar}
          label="Ngày duyệt"
          value={formatDateTime(order.approvedAt)}
        />
        <InfoTile
          icon={User}
          label="Người xác nhận xuất"
          value={order.posterBy?.fullName ?? "—"}
        />
        <InfoTile
          icon={Calendar}
          label="Ngày xác nhận xuất"
          value={formatDateTime(order.postedAt)}
        />
      </dl>
    </OutsourcingOrderDetailSectionCard>
  )
}

function formatDateTime(isoDateTime: string | null): string {
  return isoDateTime
    ? DateTime.fromISO(isoDateTime).toFormat("dd/MM/yyyy HH:mm")
    : "—"
}

type InfoTileProps = {
  icon: LucideIcon
  label: string
  value: ReactNode
}

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="flex items-center gap-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
