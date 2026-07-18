import { Icon } from "@iconify/react"

import { Card, CardContent } from "@/components/ui/card"
import { ALERT_ITEMS } from "@/features/manage/mock/manage-dashboard.mock"
import { cn } from "@/lib/utils"

export function ManageAlerts() {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold tracking-wide text-foreground uppercase">
        Cảnh báo quan trọng
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ALERT_ITEMS.map((alert) => (
          <Card key={alert.label} size="sm" className={alert.cardClassName}>
            <CardContent className="flex items-center gap-3">
              <Icon
                icon={alert.icon}
                className={cn("size-8 shrink-0", alert.accentClassName)}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-xs font-bold uppercase",
                    alert.accentClassName
                  )}
                >
                  <span className="text-lg">{alert.count}</span> {alert.label}
                </p>
                {alert.subtitle ? (
                  <p className="text-[11px] font-medium text-foreground/80">
                    {alert.subtitle}
                  </p>
                ) : (
                  <p className="text-[11px] font-medium text-foreground/80">
                    Xem chi tiết →
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
