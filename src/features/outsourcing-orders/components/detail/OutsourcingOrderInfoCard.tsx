import { DateTime } from "luxon"
import { Calendar, Info, StickyNote, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { OutsourcingOrderDetailSectionCard } from "@/features/outsourcing-orders/components/detail/OutsourcingOrderDetailSectionCard"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-order.type"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderInfoCardProps = {
  order: OutsourcingOrderDetail
}

// Ghi chú + người tạo, cộng người/ngày xác nhận gửi khi phiếu đã qua DRAFT — cùng khuôn
// OutsourcingReceiptInfoCard.tsx's `isPosted &&` block. NCC/kho xuất/ngày đã có ở header's meta
// grid nên không lặp lại ở đây.
export function OutsourcingOrderInfoCard({
  order,
}: OutsourcingOrderInfoCardProps) {
  const isDraft = order.status === InventoryDocumentStatus.DRAFT

  return (
    <OutsourcingOrderDetailSectionCard
      icon={Info}
      title="Thông tin phiếu"
      description="Ghi chú và trạng thái xác nhận"
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <InfoTile icon={StickyNote} label="Ghi chú" value={order.note ?? "—"} />
        <InfoTile
          icon={User}
          label="Người tạo"
          value={order.creatorBy?.fullName ?? "—"}
        />
        {!isDraft && (
          <>
            <InfoTile
              icon={User}
              label="Người xác nhận"
              value={order.posterBy?.fullName ?? "—"}
            />
            <InfoTile
              icon={Calendar}
              label="Ngày xác nhận"
              value={
                order.postedAt
                  ? DateTime.fromISO(order.postedAt).toFormat(
                      "dd/MM/yyyy HH:mm"
                    )
                  : "—"
              }
            />
          </>
        )}
      </dl>
    </OutsourcingOrderDetailSectionCard>
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
