import { CalendarCheck, Info, StickyNote, User, UserCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderInfoCardProps = {
  order: OutboundOrderDetail
}

// Ghi chú + người tạo + người/ngày duyệt (ẩn khi chưa duyệt) — hai field thật còn lại chưa có chỗ
// hiển thị (client/fulfillmentDate/fulfillmentType đã có ở header's meta grid). Địa chỉ giao/tài
// xế/SĐT cũ đã bỏ — BE chưa có field nào cho vận chuyển (docs/domains/inventory.md, mục "Giao
// hàng"). Lý do từ chối đã có OutboundOrderRejectionNotice.tsx riêng, không lặp lại ở đây.
export function OutboundOrderInfoCard({ order }: OutboundOrderInfoCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Info className="size-4 text-muted-foreground" />
        Thông tin phiếu
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <InfoTile icon={StickyNote} label="Ghi chú" value={order.note ?? "—"} />
        <InfoTile
          icon={User}
          label="Người tạo"
          value={order.creatorBy?.fullName ?? "—"}
        />

        {order.approverBy && (
          <InfoTile
            icon={UserCheck}
            label="Người duyệt"
            value={order.approverBy.fullName}
          />
        )}

        {order.approvedAt && (
          <InfoTile
            icon={CalendarCheck}
            label="Ngày duyệt"
            value={DateTime.fromISO(order.approvedAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
        )}
      </div>
    </section>
  )
}

type InfoTileProps = {
  icon: LucideIcon
  label: string
  value: ReactNode
}

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3" />
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
