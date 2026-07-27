import { Icon } from "@iconify/react"
import arrowDownBold from "@iconify-icons/solar/arrow-down-bold"
import arrowUpBold from "@iconify-icons/solar/arrow-up-bold"

import { Card, CardContent } from "@/components/ui/card"
import { buildOrderStatTiles } from "@/features/orders/components/order-stat-tiles"
import type { OrderStatTrendTone } from "@/features/orders/components/order-stat-tiles"
import type { OrderStats } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

const trendToneClassName: Record<OrderStatTrendTone, string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
}

type OrderStatCardsProps = {
  stats: OrderStats
}

export function OrderStatCards({ stats }: OrderStatCardsProps) {
  const tiles = buildOrderStatTiles(stats)

  return (
    // Six across only from 2xl up — a 200px card cannot hold a value like
    // "125.000.000.000 VND".
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {tiles.map((tile) => (
        <Card key={tile.label} size="sm">
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                  tile.iconClassName
                )}
              >
                <Icon icon={tile.icon} className="size-4" />
              </div>
              <p className="truncate text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {tile.label}
              </p>
            </div>

            <p className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "truncate font-bold text-foreground",
                  tile.valueSizeClassName
                )}
              >
                {tile.value}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {tile.unit}
              </span>
            </p>

            {/* No fallback text: a missing comparison renders nothing rather
                than an em-dash pretending to be data. */}
            {tile.trend ? (
              <p
                className={cn(
                  "flex items-center gap-1 text-[11px]",
                  trendToneClassName[tile.trend.tone]
                )}
              >
                {tile.trend.direction ? (
                  <Icon
                    icon={
                      tile.trend.direction === "up"
                        ? arrowUpBold
                        : arrowDownBold
                    }
                    className="size-3 shrink-0"
                  />
                ) : null}
                <span className="truncate">{tile.trend.text}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
