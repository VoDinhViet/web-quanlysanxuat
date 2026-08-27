import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Bill, Checklist, ClipboardText, Delivery } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { oqcsQueryOptions } from "@/features/oqc/api"
import { outboundOrdersQueryOptions } from "@/features/outbound-orders/api"
import { productionJobsQueryOptions } from "@/features/production-jobs/api"
import { ordersQueryOptions } from "@/features/orders/api"
import { IqcResult } from "@/lib/types/iqc.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ActivityCardShellProps = {
  icon: ComponentType<IconProps>
  iconClassName: string
  label: string
  isPending: boolean
  isEmpty: boolean
  code: ReactNode
  lines: { label: string; value: string }[]
}

// Shared chrome for the 4 "latest related document" mini-cards — a colored icon (no chip
// background) so each card reads at a glance, reusing the app's existing semantic tones rather
// than introducing new colors. Pending skeleton, empty state ("Chưa có" + muted icon, not blank
// space, per the design brief's "tránh trống trải" ask), and the populated code+lines layout.
// Each card below only supplies its own query + content.
function ActivityCardShell({
  icon: Icon,
  iconClassName,
  label,
  isPending,
  isEmpty,
  code,
  lines,
}: ActivityCardShellProps) {
  return (
    <div className="flex gap-3 p-3">
      <Icon className={cn("size-5 shrink-0", iconClassName)} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>

        {isPending ? (
          <div className="mt-1.5 space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : isEmpty ? (
          <p className="mt-1 text-xs text-muted-foreground italic">Chưa có</p>
        ) : (
          <>
            <p className="mt-0.5 truncate font-mono text-sm font-semibold">
              {code}
            </p>
            <div className="mt-0.5 space-y-0.5">
              {lines.map((line) => (
                <p
                  key={line.label}
                  className="truncate text-[11px] text-muted-foreground"
                >
                  {line.label}:{" "}
                  <span className="text-foreground">{line.value}</span>
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

type CardProps = { itemId: string }

// Backend prerequisite on every card below: none of the 4 list endpoints (GET /api/oqc,
// /api/outbound-orders, /api/production-jobs, /api/orders) accept an `itemId` filter yet — see
// each schema's own doc comment (oqc-search.schema.ts etc.) for the exact ask. `page: 1`, plus
// each list's own default (assumed newest-first) ordering, stands in for a dedicated "latest"
// endpoint — only the first row is read (`limit: 10` is each schema's smallest allowed value,
// not a real page size; a 1-row lookup isn't worth widening every list's own `limit` union for).

function QcPassActivityCard({ itemId }: CardProps) {
  const query = useQuery(
    oqcsQueryOptions({
      page: 1,
      limit: 10,
      itemId,
      result: IqcResult.PASS,
    })
  )
  const oqc = query.data?.data[0]

  return (
    <ActivityCardShell
      icon={Checklist}
      iconClassName="text-success"
      label="Lần QC PASS gần nhất"
      isPending={query.isPending}
      isEmpty={!oqc}
      code={
        oqc && (
          <RoutePermissionGate route="/manage/oqc/$oqcId" fallback={oqc.code}>
            <Link
              to="/manage/oqc/$oqcId"
              params={{ oqcId: oqc.id }}
              className="text-primary hover:underline"
            >
              {oqc.code}
            </Link>
          </RoutePermissionGate>
        )
      }
      lines={
        oqc
          ? [
              {
                label: "Ngày",
                value: DateTime.fromISO(oqc.inspectionDate).toFormat(
                  "dd/MM/yyyy"
                ),
              },
              {
                label: "SL PASS",
                value: `${quantityFormatter.format(oqc.quantity)} ${oqc.unit.name}`,
              },
            ]
          : []
      }
    />
  )
}

function DeliveryActivityCard({ itemId }: CardProps) {
  const query = useQuery(
    outboundOrdersQueryOptions({ page: 1, limit: 10, itemId })
  )
  const outboundOrder = query.data?.data[0]

  return (
    <ActivityCardShell
      icon={Delivery}
      iconClassName="text-info"
      label="Lần giao hàng gần nhất"
      isPending={query.isPending}
      isEmpty={!outboundOrder}
      code={
        outboundOrder && (
          <RoutePermissionGate
            route="/manage/outbound-orders/$outboundOrderId"
            fallback={outboundOrder.code}
          >
            <Link
              to="/manage/outbound-orders/$outboundOrderId"
              params={{ outboundOrderId: outboundOrder.id }}
              className="text-primary hover:underline"
            >
              {outboundOrder.code}
            </Link>
          </RoutePermissionGate>
        )
      }
      lines={
        outboundOrder
          ? [
              {
                label: "Ngày giao",
                value: DateTime.fromISO(outboundOrder.fulfillmentDate).toFormat(
                  "dd/MM/yyyy"
                ),
              },
              {
                label: "Khách hàng",
                value: outboundOrder.client.name,
              },
            ]
          : []
      }
    />
  )
}

function ProductionJobActivityCard({ itemId }: CardProps) {
  const query = useQuery(
    productionJobsQueryOptions({ page: 1, limit: 10, itemId })
  )
  const job = query.data?.data[0]

  return (
    <ActivityCardShell
      icon={ClipboardText}
      iconClassName="text-warning"
      label="LSX gần nhất"
      isPending={query.isPending}
      isEmpty={!job}
      code={
        job && (
          <RoutePermissionGate
            route="/manage/production-jobs/$productionJobId"
            fallback={job.code}
          >
            <Link
              to="/manage/production-jobs/$productionJobId"
              params={{ productionJobId: job.id }}
              search={{ tab: "info" }}
              className="text-primary hover:underline"
            >
              {job.code}
            </Link>
          </RoutePermissionGate>
        )
      }
      lines={
        job
          ? [
              {
                label: "Ngày sản xuất",
                value: DateTime.fromISO(job.orderDate).toFormat("dd/MM/yyyy"),
              },
              {
                label: "SL LSX",
                value: quantityFormatter.format(job.quantity),
              },
            ]
          : []
      }
    />
  )
}

function OrderActivityCard({ itemId }: CardProps) {
  const query = useQuery(ordersQueryOptions({ page: 1, limit: 10, itemId }))
  const order = query.data?.data[0]

  return (
    <ActivityCardShell
      icon={Bill}
      iconClassName="text-primary"
      label="PO liên quan chính"
      isPending={query.isPending}
      isEmpty={!order}
      code={
        order && (
          <RoutePermissionGate
            route="/manage/orders/$orderId"
            fallback={order.code}
          >
            <Link
              to="/manage/orders/$orderId"
              params={{ orderId: order.id }}
              className="text-primary hover:underline"
            >
              {order.code}
            </Link>
          </RoutePermissionGate>
        )
      }
      lines={
        order
          ? [
              {
                label: "Khách hàng",
                value: order.client?.name ?? "—",
              },
              {
                label: "Ngày đặt",
                value: DateTime.fromISO(order.orderDate).toFormat("dd/MM/yyyy"),
              },
            ]
          : []
      }
    />
  )
}

type InventoryProductRecentActivityCardsProps = {
  itemId: string
}

export function InventoryProductRecentActivityCards({
  itemId,
}: InventoryProductRecentActivityCardsProps) {
  return (
    <div className="grid grid-cols-2 divide-x divide-border/60 rounded-lg border border-border/60 lg:grid-cols-4">
      <QcPassActivityCard itemId={itemId} />
      <DeliveryActivityCard itemId={itemId} />
      <ProductionJobActivityCard itemId={itemId} />
      <OrderActivityCard itemId={itemId} />
    </div>
  )
}
