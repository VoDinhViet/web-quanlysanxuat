import { Card, CardContent } from "@/components/ui/card"
import { buildOrderStatTiles } from "@/features/orders/components/order-stat-tiles"
import type { OrderStats } from "@/features/orders/types/order.type"
import { cn } from "@/lib/utils"

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
        <Card
          key={tile.label}
          size="sm"
          className={cn(
            "relative pl-1 before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:content-['']",
            tile.accentClassName
          )}
        >
          <CardContent className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                tile.iconClassName
              )}
            >
              <tile.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {tile.label}
              </p>
              <p className="truncate text-lg font-semibold text-foreground">
                {tile.value}
              </p>
              {/* No fallback text: a missing comparison renders nothing rather
                  than an em-dash pretending to be data. */}
              {tile.subtitle ? (
                <p className="truncate text-[11px] text-muted-foreground">
                  {tile.subtitle}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
