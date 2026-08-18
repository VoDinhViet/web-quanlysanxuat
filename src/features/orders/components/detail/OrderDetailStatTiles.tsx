import { buildMockDeliveryProgress } from "@/features/orders/mock/order-detail.mock"
import { MockDataBadge } from "@/components/shared/feedback/MockDataBadge"
import { vndFormatter } from "@/lib/currency"
import type { OrderDetail, OrderItem } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

const countFormatter = new Intl.NumberFormat("vi-VN")

type StatTile = {
  label: string
  value: string
  subtitle: string | null
  toneClassName: string
  isMock: boolean
}

type OrderDetailStatTilesProps = {
  order: OrderDetail
  items: OrderItem[]
}

// A single row of 4 flat tinted boxes beside the meta grid in
// OrderDetailSummaryCard — "Đã giao"/"Còn lại" are the 2 the backend can't
// compute yet (see order-detail-mock.ts), each carrying its own percent
// subtitle; the 2 real tiles stay plain/neutral with no subtitle to avoid
// implying a comparison that doesn't exist.
export function OrderDetailStatTiles({
  order,
  items,
}: OrderDetailStatTilesProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const progress = buildMockDeliveryProgress(order, items)

  const tiles: StatTile[] = [
    {
      label: "Tổng giá trị",
      value: `${vndFormatter.format(order.totalVnd)} VND`,
      subtitle: null,
      toneClassName: "bg-muted/50 text-foreground",
      isMock: false,
    },
    {
      label: "Đã giao",
      value: `${vndFormatter.format(progress.deliveredVnd)} VND`,
      subtitle: `${progress.deliveredPercent}%`,
      toneClassName: "bg-success/10 text-success",
      isMock: true,
    },
    {
      label: "Còn lại",
      value: `${vndFormatter.format(progress.remainingVnd)} VND`,
      subtitle: `${100 - progress.deliveredPercent}%`,
      toneClassName: "bg-warning/10 text-warning",
      isMock: true,
    },
    {
      label: "Số lượng",
      value: `${countFormatter.format(totalQuantity)} SP`,
      subtitle: null,
      toneClassName: "bg-muted/50 text-foreground",
      isMock: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cn("rounded-lg p-3", tile.toneClassName)}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[10px] font-semibold tracking-wide uppercase opacity-80">
              {tile.label}
            </p>
            {tile.isMock ? (
              <MockDataBadge className="h-4 px-1.5 text-[9px]" />
            ) : null}
          </div>
          <p className="mt-1 truncate text-lg font-bold">{tile.value}</p>
          {tile.subtitle ? (
            <p className="text-[11px] opacity-70">{tile.subtitle}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
