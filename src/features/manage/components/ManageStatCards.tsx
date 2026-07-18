import { Icon } from "@iconify/react"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { STAT_CARDS } from "@/features/manage/mock/manage-dashboard.mock"
import { cn } from "@/lib/utils"

export function ManageStatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {STAT_CARDS.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardContent className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                stat.iconClassName
              )}
            >
              <Icon icon={stat.icon} className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground uppercase">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stat.value}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {stat.unit}
                </span>
              </p>
              {stat.trend ? (
                <p
                  className={cn(
                    "flex items-center gap-1 text-[11px]",
                    stat.trend.direction === "up" && "text-emerald-600",
                    stat.trend.direction === "down" && "text-destructive",
                    !stat.trend.direction && "text-muted-foreground"
                  )}
                >
                  {stat.trend.direction === "up" ? (
                    <ArrowUp className="size-3" />
                  ) : null}
                  {stat.trend.direction === "down" ? (
                    <ArrowDown className="size-3" />
                  ) : null}
                  {stat.trend.text}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
