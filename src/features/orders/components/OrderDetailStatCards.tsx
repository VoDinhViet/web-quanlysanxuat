import { Icon } from "@iconify/react"
import billListBold from "@iconify-icons/solar/bill-list-bold"
import boxBold from "@iconify-icons/solar/box-bold"
import calendarMarkBold from "@iconify-icons/solar/calendar-mark-bold"
import walletMoneyBold from "@iconify-icons/solar/wallet-money-bold"
import { DateTime } from "luxon"
import type { IconifyIcon } from "@iconify/types"

import { Card, CardContent } from "@/components/ui/card"
import { resolveDeliveryTone } from "@/lib/types/order.type"
import type { DeliveryTone, OrderDetail } from "@/lib/types/order.type"
import { vndFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"

const countFormatter = new Intl.NumberFormat("vi-VN")

const DELIVERY_TONE_ICON_CLASSNAME: Record<DeliveryTone, string> = {
  overdue: "bg-destructive/15 text-destructive",
  "near-due": "bg-warning/15 text-warning",
  normal: "bg-info/15 text-info",
}

type StatTile = {
  label: string
  value: string
  icon: IconifyIcon
  iconClassName: string
}

type OrderDetailStatCardsProps = {
  order: OrderDetail
}

// Only tiles the backend actually computes — no per-order "delivered/remaining"
// stats exist yet (see the `Order`/`OrderDetail` type comments), so unlike the
// list page's OrderStatCards, this stays to four plain facts.
export function OrderDetailStatCards({ order }: OrderDetailStatCardsProps) {
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )
  const deliveryTone = resolveDeliveryTone(order)

  const tiles: StatTile[] = [
    {
      label: "Tổng giá trị",
      value: `${vndFormatter.format(order.totalVnd)} VND`,
      icon: walletMoneyBold,
      iconClassName: "bg-success/15 text-success",
    },
    {
      label: "Số dòng sản phẩm",
      value: countFormatter.format(order.items.length),
      icon: boxBold,
      iconClassName: "bg-primary/15 text-primary",
    },
    {
      label: "Tổng số lượng",
      value: countFormatter.format(totalQuantity),
      icon: billListBold,
      iconClassName: "bg-info/15 text-info",
    },
    {
      label: "Ngày giao hàng",
      value: order.dueDate
        ? DateTime.fromISO(order.dueDate).toFormat("dd/MM/yyyy")
        : "Chưa xác định",
      icon: calendarMarkBold,
      iconClassName: DELIVERY_TONE_ICON_CLASSNAME[deliveryTone],
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                tile.iconClassName
              )}
            >
              <Icon icon={tile.icon} className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {tile.label}
              </p>
              <p className="truncate text-base font-bold text-foreground">
                {tile.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
