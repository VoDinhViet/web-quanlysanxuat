import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { ManageCardLink } from "@/features/manage/components/primitives/ManageCardLink"
import { ManageCardTitle } from "@/features/manage/components/primitives/ManageCardTitle"
import { useUpcomingDeliveries } from "@/features/manage/hooks/use-upcoming-deliveries"
import { outboundOrderStatusLabels } from "@/lib/types/outbound-order.type"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"
import { DateTime } from "luxon"

const columnHelper = createColumnHelper<OutboundOrder>()

const columns = [
  columnHelper.accessor("code", {
    header: "DO",
    meta: { cellClassName: "text-xs font-medium" },
  }),
  columnHelper.accessor((row) => row.client.name, {
    id: "client",
    header: "Khách hàng",
    meta: { cellClassName: "max-w-28 truncate text-xs" },
  }),
  columnHelper.accessor("fulfillmentDate", {
    header: "Ngày giao",
    meta: { cellClassName: "text-xs" },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  columnHelper.accessor("status", {
    header: "Trạng thái",
    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
      >
        {outboundOrderStatusLabels[getValue()]}
      </Badge>
    ),
  }),
]

export function ManageUpcomingDeliveriesTable() {
  const upcomingDeliveries = useUpcomingDeliveries()
  const table = useReactTable({
    data: upcomingDeliveries.top5,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (upcomingDeliveries.isPending) {
    return <Skeleton className="h-64 rounded-lg" />
  }

  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ManageCardTitle>DO sắp giao</ManageCardTitle>
      </div>
      <Table className="[&_td]:border-r-0 [&_td]:py-2 [&_td]:first:pl-4 [&_td]:last:pr-4 [&_th]:border-r-0 [&_th]:first:pl-4 [&_th]:last:pr-4">
        <TableHeader className="bg-transparent">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[11px] font-normal tracking-normal text-muted-foreground uppercase"
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
          {upcomingDeliveries.isError ? (
            <TableEmpty
              colSpan={columns.length}
              title="Không tải được dữ liệu"
            />
          ) : rows.length === 0 ? (
            <TableEmpty colSpan={columns.length} title="Chưa có dữ liệu" />
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.cellClassName}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <ManageCardLink label="Xem tất cả →" />
    </div>
  )
}
