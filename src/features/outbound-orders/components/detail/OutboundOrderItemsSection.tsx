import { Link } from "@tanstack/react-router"
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import type { OutboundOrderItem } from "@/lib/types/outbound-order.type"

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

  col.display({
    id: "order",
    header: "Mã PO",
    meta: { headerClassName: "min-w-24" },
    cell: ({ row }) => (
      <Link
        to="/manage/orders/$orderId"
        params={{ orderId: row.original.order.id }}
        className="font-mono text-xs text-primary hover:underline"
      >
        {row.original.order.code}
      </Link>
    ),
  }),

  col.display({
    id: "productionJob",
    header: "Job",
    meta: { headerClassName: "min-w-24" },
    cell: ({ row }) => {
      const job = row.original.productionJob
      if (!job) return "--"
      return (
        <Link
          to="/manage/production-jobs/$productionJobId"
          params={{ productionJobId: job.id }}
          search={{ tab: "info" }}
          className="font-mono text-xs text-primary hover:underline"
        >
          {job.code}
        </Link>
      )
    },
  }),

  col.accessor((row) => row.item.code, {
    id: "itemCode",
    header: "Mã sản phẩm",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold">{getValue()}</span>
    ),
  }),

  col.accessor((row) => row.item.name, {
    id: "itemName",
    header: "Tên sản phẩm",
    meta: { headerClassName: "min-w-48" },
  }),

  col.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: {
      headerClassName: "min-w-16 text-center",
      cellClassName: "text-center",
    },
  }),

  col.accessor("orderedQuantity", {
    header: "SL PO",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("issuedQuantity", {
    header: "Đã giao",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("onHandQuantity", {
    header: "Tồn TP",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("heldQuantity", {
    header: "Đã giữ",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("availableQuantity", {
    header: "Có thể giao",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums font-semibold text-emerald-600",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("quantity", {
    header: "SL giao",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums font-semibold",
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
  items: OutboundOrderItem[]
}

// `totalQuantity` tự tính từ items (không có nguồn BE-computed nào ở cấp header — xem
// outbound-order.type.ts's OutboundOrderDetail comment).
export function OutboundOrderItemsSection({
  items,
}: OutboundOrderItemsSectionProps) {
  const table = useReactTable({
    data: items,
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách thành phẩm giao hàng
      </h3>

      {items.length === 0 ? (
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
          <TableFooter>
            <TableRow className="h-12">
              <TableCell colSpan={6} className="font-semibold">
                Tổng
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {numberFmt.format(totalQuantity)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  )
}
