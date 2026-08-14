import { PackageSearch } from "lucide-react"
import { createColumnHelper } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/DataTable"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import type {
  OutboundOrderDetail,
  OutboundOrderItem,
} from "@/lib/types/outbound-order.type"

const col = createColumnHelper<OutboundOrderItem>()
const numberFmt = new Intl.NumberFormat("vi-VN")

const itemColumns = [
  col.display({
    id: "stt",
    header: "STT",
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
    cell: ({ row }) => row.index + 1,
  }),

  col.accessor("productCode", {
    header: "Mã sản phẩm",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold">{getValue()}</span>
    ),
  }),

  col.accessor("productName", {
    header: "Tên sản phẩm",
    meta: { headerClassName: "min-w-48" },
  }),

  col.accessor("unit", {
    header: "ĐVT",
    meta: {
      headerClassName: "min-w-16 text-center",
      cellClassName: "text-center",
    },
  }),

  col.accessor("orderedQuantity", {
    header: "SL yêu cầu",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("deliveredQuantity", {
    header: "SL thực giao",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums font-semibold text-emerald-600",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
]

type OutboundOrderItemsSectionProps = {
  detail: OutboundOrderDetail
}

export function OutboundOrderItemsSection({
  detail,
}: OutboundOrderItemsSectionProps) {
  const totalDelivered = detail.items.reduce(
    (sum, item) => sum + item.deliveredQuantity,
    0
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách thành phẩm giao hàng
      </h3>

      <DataTable
        rows={detail.items}
        columns={itemColumns}
        isPending={false}
        bare
        emptyState={
          <TableEmptyState
            icon={PackageSearch}
            title="Chưa có sản phẩm nào"
            description="Đơn giao hàng này chưa có dòng sản phẩm nào."
          />
        }
      />

      {detail.items.length > 0 && (
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tổng cộng SL thực giao:
          </span>
          <span className="font-semibold text-emerald-600 tabular-nums">
            {numberFmt.format(totalDelivered)} {detail.unit}
          </span>
        </div>
      )}
    </div>
  )
}
