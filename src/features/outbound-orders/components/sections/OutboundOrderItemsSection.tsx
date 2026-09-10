import { Link } from "@tanstack/react-router"
import { PackageSearch } from "lucide-react"
import { createColumnHelper, flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import type { OutboundOrderItem } from "@/lib/types/outbound-order.type"

const col = createColumnHelper<typeof appTableFeatures, OutboundOrderItem>()
const numberFmt = new Intl.NumberFormat("vi-VN")

const itemColumns = col.columns([
  col.display({
    id: "stt",
    header: "STT",
    meta: {
      headerClassName: "w-10 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
    cell: ({ row }) => row.index + 1,
  }),

  col.display({
    id: "poJob",
    header: "PO / Job",
    meta: { headerClassName: "min-w-24" },
    cell: ({ row }) => {
      const job = row.original.productionJob
      return (
        <div className="flex flex-col gap-0.5">
          <Link
            to="/manage/orders/$orderId"
            params={{ orderId: row.original.order.id }}
            className="font-mono text-xs font-semibold text-primary hover:underline"
          >
            {row.original.order.code}
          </Link>
          {job ? (
            <Link
              to="/manage/production-jobs/$productionJobId"
              params={{ productionJobId: job.id }}
              search={{ tab: "info" }}
              className="font-mono text-[11px] text-muted-foreground hover:text-primary hover:underline"
            >
              {job.code}
            </Link>
          ) : (
            <span className="text-[11px] text-muted-foreground">—</span>
          )}
        </div>
      )
    },
  }),

  col.display({
    id: "product",
    header: "Sản phẩm",
    meta: { headerClassName: "min-w-44" },
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground text-xs leading-tight">
          {row.original.item.name}
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span>{row.original.item.code}</span>
          <span>·</span>
          <span>ĐVT: {row.original.unit.name}</span>
        </div>
      </div>
    ),
  }),

  col.accessor("orderedQuantity", {
    header: "SL PO",
    meta: {
      headerClassName: "w-20 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("issuedQuantity", {
    header: "Đã giao",
    meta: {
      headerClassName: "w-20 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.display({
    id: "onHandQuantity",
    header: "Tồn TP",
    meta: {
      headerClassName: "w-20 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ row }) => {
      const onHand = row.original.onHandQuantity
      const held = row.original.heldQuantity
      return (
        <div className="flex flex-col items-end gap-0.5">
          <span>{numberFmt.format(onHand)}</span>
          {held > 0 ? (
            <span className="text-[10px] text-muted-foreground">
              (Giữ: {numberFmt.format(held)})
            </span>
          ) : null}
        </div>
      )
    },
  }),

  col.accessor("availableQuantity", {
    header: "Có thể giao",
    meta: {
      headerClassName: "w-24 text-right",
      cellClassName: "text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("quantity", {
    header: "SL giao",
    meta: {
      headerClassName: "w-24 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => (
      <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary dark:bg-primary/20">
        {numberFmt.format(getValue())}
      </span>
    ),
  }),

  col.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => getValue() || "—",
  }),
])

type OutboundOrderItemsSectionProps = {
  items: OutboundOrderItem[]
}

// `totalQuantity` tự tính từ items (không có nguồn BE-computed nào ở cấp header — xem
// outbound-order.type.ts's OutboundOrderDetail comment).
export function OutboundOrderItemsSection({
  items,
}: OutboundOrderItemsSectionProps) {
  const table = useTable({
    data: items,
    columns: itemColumns,
    features: appTableFeatures,
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
        <Table aria-label="Danh sách thành phẩm giao hàng">
          <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
            <TableRow>
              {table.getFlatHeaders().map((header) => (
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
              <TableCell colSpan={7} className="font-semibold text-right">
                Tổng SL giao
              </TableCell>
              <TableCell className="text-right font-bold tabular-nums text-primary">
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
