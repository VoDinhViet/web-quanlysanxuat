import { Truck } from "lucide-react"
import { DateTime } from "luxon"

import { MockDataBadge } from "@/components/shared/MockDataBadge"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"
import { outboundDeliveryMethodLabels } from "@/lib/types/outbound-order.type"

type OutboundOrderInfoCardProps = {
  detail: OutboundOrderDetail
}

export function OutboundOrderInfoCard({ detail }: OutboundOrderInfoCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Truck className="size-4 text-muted-foreground" />
        Thông tin vận chuyển & giao hàng
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Hình thức vận chuyển
          </p>
          <p className="text-sm font-medium text-foreground">
            {outboundDeliveryMethodLabels[detail.deliveryMethod]}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Địa chỉ giao hàng
          </p>
          <p className="text-sm font-medium text-foreground">
            {detail.deliveryAddress ?? "—"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Tài xế / Số điện thoại
          </p>
          <p className="text-sm font-medium text-foreground">
            {detail.driverName ? `${detail.driverName} (${detail.driverPhone ?? "—"})` : "—"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Thời gian tạo đơn
          </p>
          <p className="text-sm font-medium text-foreground">
            {DateTime.fromISO(detail.createdAt).toFormat("dd/MM/yyyy HH:mm")}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          <MockDataBadge className="h-4 px-1.5 text-[9px]" />
          <span className="text-[10px] text-muted-foreground">
            Dữ liệu giả lập
          </span>
        </div>
      </div>
    </section>
  )
}
