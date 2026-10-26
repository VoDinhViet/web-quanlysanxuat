import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ClipboardList, Receipt } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { outboundOrderStatsQueryOptions } from "@/features/outbound-orders/api/options"
import { outboundOrderStatsSearchSchema } from "@/features/outbound-orders/schemas/outbound-order-stats-search.schema"
import type { OutboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"
import {
  OutboundOrderInvoiceStatus,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"
import type { OutboundOrderStats } from "@/lib/types/outbound-order.type"
import { cn } from "@/lib/utils"

type StatTile = {
  label: string
  icon: LucideIcon
  iconClassName: string
  statKey: keyof OutboundOrderStats
  // Bộ lọc ghi lên URL khi bấm ô; ô "Tổng DO" xóa cả hai.
  filter: Pick<OutboundOrdersSearchSchema, "status" | "invoiceStatus">
  isActive: (search: OutboundOrdersSearchSchema) => boolean
}

const statTiles: StatTile[] = [
  {
    label: "Tổng DO",
    icon: ClipboardList,
    iconClassName: "bg-primary/15 text-primary",
    statKey: "total",
    filter: { status: undefined, invoiceStatus: undefined },
    isActive: (search) =>
      search.status === undefined && search.invoiceStatus === undefined,
  },
  {
    label: "DO chưa xuất hóa đơn",
    icon: Receipt,
    iconClassName: "bg-warning-soft text-warning-ink",
    statKey: "notInvoiced",
    // Chỉ DO đã giao mới cần hóa đơn: khớp đúng cách backend đếm ô này.
    filter: {
      status: OutboundOrderStatus.DELIVERED,
      invoiceStatus: OutboundOrderInvoiceStatus.NOT_ISSUED,
    },
    isActive: (search) =>
      search.status === OutboundOrderStatus.DELIVERED &&
      search.invoiceStatus === OutboundOrderInvoiceStatus.NOT_ISSUED,
  },
]

const gridClassName = "grid grid-cols-2 gap-3 sm:max-w-xl"

// Đếm theo các ô lọc chung (khách, PO, ngày...) nhưng không theo trạng thái, nên con số không đổi
// khi bấm ô. Thống kê là phụ so với danh sách: lần tải đầu lỗi thì ẩn hàng thay vì báo lỗi cả trang.
export function OutboundOrderStatCards() {
  const search = useSearch({ from: "/(authed)/manage_/outbound-orders/" })
  const navigate = useNavigate({ from: "/manage/outbound-orders/" })

  const statsQuery = useQuery({
    ...outboundOrderStatsQueryOptions(
      outboundOrderStatsSearchSchema.parse(search)
    ),
    placeholderData: keepPreviousData,
  })

  if (statsQuery.isPending) {
    return (
      <div className={gridClassName}>
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-card"
          >
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (statsQuery.data === undefined) {
    return null
  }

  return (
    <div className={gridClassName}>
      {statTiles.map((tile) => {
        const isActive = tile.isActive(search)

        return (
          <button
            key={tile.label}
            type="button"
            aria-pressed={isActive}
            onClick={() =>
              void navigate({
                search: (prev) => ({ ...prev, ...tile.filter, page: 1 }),
              })
            }
            className={cn(
              "flex items-center gap-3 rounded-lg bg-card p-4 text-left shadow-card transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive && "ring-2 ring-primary"
            )}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                tile.iconClassName
              )}
            >
              <tile.icon className="size-5" aria-hidden />
            </div>

            <div className="min-w-0">
              <p className="text-xs leading-tight font-medium text-muted-foreground">
                {tile.label}
              </p>
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {statsQuery.data[tile.statKey]}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
