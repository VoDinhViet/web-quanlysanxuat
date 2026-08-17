import { PackageSearch } from "lucide-react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
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
  const table = useReactTable({
    data: detail.items,
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  })

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

      {detail.items.length === 0 ? (
        <TableEmpty
          icon={PackageSearch}
          title="Chưa có sản phẩm nào"
          description="Đơn giao hàng này chưa có dòng sản phẩm nào."
        />
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-12 hover:bg-muted/45">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.headerClassName}
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-14 bg-card hover:bg-muted/25">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.cellClassName}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
