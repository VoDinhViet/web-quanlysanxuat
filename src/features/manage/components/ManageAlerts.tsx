import { useQuery } from "@tanstack/react-query"
import { Delivery, DangerTriangle, DocumentText } from "@solar-icons/react"
import type { ComponentType } from "react"
import type { IconProps } from "@solar-icons/react"

import { Skeleton } from "@/components/ui/skeleton"
import { reportAlertsQueryOptions } from "@/features/reports/api"
import { cn } from "@/lib/utils"

type AlertConfig = {
  label: string
  icon: ComponentType<IconProps>
  cardClassName: string
  accentClassName: string
  subtitle: string | null
  count: number | undefined
  isPending: boolean
}

export function ManageAlerts() {
  const alertsQuery = useQuery(reportAlertsQueryOptions())

  const alerts: AlertConfig[] = [
    {
      label: "Job trễ hạn",
      icon: DangerTriangle,
      cardClassName:
        "border border-l-4 border-destructive/30 border-l-destructive bg-destructive/10",
      accentClassName: "text-destructive",
      subtitle: null,
      count: alertsQuery.data?.jobDueDate,
      isPending: alertsQuery.isPending,
    },
    {
      label: "OS trễ hạn",
      icon: Delivery,
      cardClassName:
        "border border-l-4 border-destructive/30 border-l-destructive bg-destructive/10",
      accentClassName: "text-destructive",
      subtitle: null,
      count: alertsQuery.data?.outsourcingOrderDueDate,
      isPending: alertsQuery.isPending,
    },
    {
      label: "NCR chưa xử lý",
      icon: DocumentText,
      cardClassName:
        "border border-l-4 border-rose-300 border-l-rose-500 bg-rose-50 dark:border-rose-800/40 dark:border-l-rose-500 dark:bg-rose-500/10",
      accentClassName: "text-rose-600 dark:text-rose-400",
      subtitle: null,
      count: alertsQuery.data?.openNcr,
      isPending: alertsQuery.isPending,
    },
    {
      label: "DO sắp giao",
      icon: Delivery,
      cardClassName:
        "border border-l-4 border-blue-300 border-l-blue-500 bg-blue-50 dark:border-blue-800/40 dark:border-l-blue-500 dark:bg-blue-500/10",
      accentClassName: "text-blue-600 dark:text-blue-400",
      subtitle: "Trong 3 ngày tới",
      count: alertsQuery.data?.upcomingDeliveries,
      isPending: alertsQuery.isPending,
    },
  ]

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold tracking-wide text-foreground uppercase">
        Cảnh báo quan trọng
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {alerts.map((alert) =>
          alert.isPending ? (
            <Skeleton key={alert.label} className="h-16 rounded-lg" />
          ) : (
            <div
              key={alert.label}
              className={cn(
                "flex items-center gap-3 rounded-lg bg-card p-4 shadow-card",
                alert.cardClassName
              )}
            >
              <alert.icon
                className={cn("size-8 shrink-0", alert.accentClassName)}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-xs font-bold uppercase",
                    alert.accentClassName
                  )}
                >
                  <span className="text-lg">{alert.count ?? "—"}</span>{" "}
                  {alert.label}
                </p>
                <p className="text-[11px] font-medium text-foreground/80">
                  {alert.subtitle ?? "Xem chi tiết →"}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  )
}
