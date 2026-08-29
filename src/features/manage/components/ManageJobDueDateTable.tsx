import { useQuery } from "@tanstack/react-query"
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
import { ManageCardLink } from "@/features/manage/components/ManageCardLink"
import { ManageCardTitle } from "@/features/manage/components/ManageCardTitle"
import { jobDueDateQueryOptions } from "@/features/reports/api"
import {
  ProductionJobStatus,
  productionJobStatusLabels,
} from "@/lib/types/production-job.type"
import type { JobDueDate } from "@/lib/types/report.type"
import { cn } from "@/lib/utils"
import { DateTime } from "luxon"

const productionJobStatusStyles: Record<ProductionJobStatus, string> = {
  [ProductionJobStatus.PENDING]: "bg-muted text-muted-foreground",
  [ProductionJobStatus.IN_PROGRESS]:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  [ProductionJobStatus.WAITING_QC]:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400",
  [ProductionJobStatus.WAITING_DELIVERY]:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  [ProductionJobStatus.COMPLETED]: "bg-success/15 text-success",
}

function daysSinceDueDate(dueDate: string): number {
  return Math.max(
    0,
    Math.floor(DateTime.now().diff(DateTime.fromISO(dueDate), "days").days)
  )
}

const columnHelper = createColumnHelper<JobDueDate>()

const columns = [
  columnHelper.accessor("code", {
    header: "Job",
    meta: { cellClassName: "text-xs font-medium" },
  }),
  columnHelper.accessor("orderCode", {
    header: "PO",
    meta: { cellClassName: "text-xs" },
  }),
  columnHelper.accessor("dueDate", {
    header: "Ngày giao",
    meta: { cellClassName: "text-xs" },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  columnHelper.display({
    id: "daysSinceDueDate",
    header: "Trễ hạn",
    meta: { cellClassName: "text-xs text-destructive" },
    cell: ({ row }) => `${daysSinceDueDate(row.original.dueDate)} ngày`,
  }),
  columnHelper.accessor("status", {
    header: "Trạng thái",
    cell: ({ getValue }) => {
      const status = getValue()

      return (
        <Badge variant="outline" className={productionJobStatusStyles[status]}>
          {productionJobStatusLabels[status]}
        </Badge>
      )
    },
  }),
]

export function ManageJobDueDateTable() {
  const query = useQuery(jobDueDateQueryOptions())
  const table = useReactTable({
    data: query.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (query.isPending) {
    return <Skeleton className="h-64 rounded-lg" />
  }

  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ManageCardTitle>Job trễ hạn</ManageCardTitle>
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
      <ManageCardLink label="Xem tất cả →" />
    </div>
  )
}
