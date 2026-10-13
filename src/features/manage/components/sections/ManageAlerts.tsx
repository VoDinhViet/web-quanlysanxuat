import { useQuery } from "@tanstack/react-query"
import { Delivery, DangerTriangle } from "@solar-icons/react"
import type { ComponentType } from "react"
import type { IconProps } from "@solar-icons/react"

import { Skeleton } from "@/components/ui/skeleton"
import { reportAlertsQueryOptions } from "@/features/reports/api"
import { ManageCardLink } from "@/features/manage/components/primitives/ManageCardLink"
import { cn } from "@/lib/utils"
import type { ManageRoutePath } from "@/lib/route-permissions"

type AlertConfig = {
  label: string
  icon: ComponentType<IconProps>
  cardClassName: string
  accentClassName: string
  subtitle: string | null
  count: number | undefined
  isPending: boolean
  to: ManageRoutePath
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
      to: "/manage/production-jobs",
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
      to: "/manage/outsourcing-orders",
    },
    {
      label: "DO sắp giao",
      icon: Delivery,
      cardClassName:
        "border border-l-4 border-info/30 border-l-info bg-info-soft",
      accentClassName: "text-info-ink",
      subtitle: "Trong 3 ngày tới",
      count: alertsQuery.data?.upcomingDeliveries,
      isPending: alertsQuery.isPending,
      to: "/manage/outbound-orders",
    },
  ]

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium text-foreground">
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
                    "truncate text-xs font-medium",
                    alert.accentClassName
                  )}
                >
                  <span className="text-lg">{alert.count ?? "—"}</span>{" "}
                  {alert.label}
                </p>
                {alert.subtitle && (
                  <p className="text-xs font-medium text-foreground/80">
                    {alert.subtitle}
                  </p>
                )}
                <ManageCardLink to={alert.to} className="justify-start" />
              </div>
            </div>
          )
        )}
      </div>
    </section>
  )
}
