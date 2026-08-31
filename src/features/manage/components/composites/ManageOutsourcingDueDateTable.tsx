import { useQuery } from "@tanstack/react-query"
import { createColumnHelper, flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
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
import { outsourcingOrderDueDateQueryOptions } from "@/features/reports/api"
import type { OutsourcingOrderDueDate } from "@/lib/types/report.type"
import { cn } from "@/lib/utils"
import { DateTime } from "luxon"

function daysSinceDueDate(expectedReturnDate: string): number {
  return Math.max(
    0,
    Math.floor(
      DateTime.now().diff(DateTime.fromISO(expectedReturnDate), "days").days
    )
  )
}

const columnHelper = createColumnHelper<
  typeof appTableFeatures,
  OutsourcingOrderDueDate
>()

const columns = columnHelper.columns([
  columnHelper.accessor("code", {
    header: "OS",
    meta: { cellClassName: "text-xs font-medium" },
  }),
  columnHelper.accessor("supplierName", {
    header: "NCC",
    meta: { cellClassName: "max-w-16 truncate text-xs" },
  }),
  columnHelper.accessor("expectedReturnDate", {
    header: "Ngày hẹn",
    meta: { cellClassName: "text-xs" },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  columnHelper.display({
    id: "daysSinceDueDate",
    header: "Trễ",
    meta: { cellClassName: "text-xs text-destructive" },
    cell: ({ row }) =>
      `${daysSinceDueDate(row.original.expectedReturnDate)} ngày`,
  }),
])

export function ManageOutsourcingDueDateTable() {
  const query = useQuery(outsourcingOrderDueDateQueryOptions())
  const table = useTable({
    data: query.data ?? [],
    columns,
    features: appTableFeatures,
  })

  if (query.isPending) {
    return <Skeleton className="h-64 rounded-lg" />
  }

  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ManageCardTitle>Gia công ngoài trễ hạn</ManageCardTitle>
      </div>
      <div className={cn(query.isFetching && "opacity-60 transition-opacity")}>
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
            {query.isError ? (
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ManageCardLink label="Xem tất cả →" to="/manage/outsourcing-orders" />
    </div>
  )
}
