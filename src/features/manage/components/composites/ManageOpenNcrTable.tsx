import { useQuery } from "@tanstack/react-query"
import { createColumnHelper, flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { ManageCardTitle } from "@/features/manage/components/primitives/ManageCardTitle"
import { openNcrQueryOptions } from "@/features/reports/api"
import type { OpenNcr } from "@/lib/types/report.type"
import { cn } from "@/lib/utils"
import { DateTime } from "luxon"

const openNcrKindLabels: Record<OpenNcr["kind"], string> = {
  INCOMING: "IQC",
  OUTGOING: "OQC",
}

// `status = IN_PROGRESS` gộp 2 tình huống khác nhau tuỳ nguồn (IQC: chờ trả NCC; OQC: đang rework)
// từ 2026-08-29 — tra theo cả `kind` lẫn `status`, không chỉ `status` như trước.
const openNcrStatusLabels: Record<
  OpenNcr["kind"],
  Record<OpenNcr["status"], string>
> = {
  INCOMING: { PENDING: "Chờ xử lý", IN_PROGRESS: "Chờ trả NCC" },
  OUTGOING: { PENDING: "Chờ xử lý", IN_PROGRESS: "Đang rework" },
}

const openNcrStatusStyles: Record<
  OpenNcr["kind"],
  Record<OpenNcr["status"], string>
> = {
  INCOMING: {
    PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    IN_PROGRESS: "bg-destructive/15 text-destructive",
  },
  OUTGOING: {
    PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    IN_PROGRESS:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
}

const columnHelper = createColumnHelper<typeof appTableFeatures, OpenNcr>()

const columns = columnHelper.columns([
  columnHelper.accessor("code", {
    header: "NCR",
    meta: { cellClassName: "text-xs font-medium" },
  }),
  columnHelper.accessor((row) => openNcrKindLabels[row.kind], {
    id: "kind",
    header: "Nguồn",
    meta: { cellClassName: "text-xs" },
  }),
  columnHelper.accessor("createdAt", {
    header: "Ngày tạo",
    meta: { cellClassName: "text-xs" },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  columnHelper.accessor("status", {
    header: "Trạng thái",
    cell: ({ row }) => {
      const { kind, status } = row.original

      return (
        <Badge variant="outline" className={openNcrStatusStyles[kind][status]}>
          {openNcrStatusLabels[kind][status]}
        </Badge>
      )
    },
  }),
])

export function ManageOpenNcrTable() {
  const query = useQuery(openNcrQueryOptions())
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
        <ManageCardTitle>NCR chưa xử lý</ManageCardTitle>
      </div>
      <div className={cn(query.isFetching && "opacity-60 transition-opacity")}>
        <Table
          aria-label="NCR chưa xử lý"
          className="[&_td]:border-r-0 [&_td]:py-2 [&_td]:first:pl-4 [&_td]:last:pr-4 [&_th]:border-r-0 [&_th]:first:pl-4 [&_th]:last:pr-4"
        >
          <TableHeader className="bg-transparent [&>tr]:hover:bg-transparent">
            <TableRow>
              {table.getFlatHeaders().map((header) => (
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
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <TableEmpty
                    colSpan={columns.length}
                    title={
                      query.isError
                        ? "Không tải được dữ liệu"
                        : "Chưa có dữ liệu"
                    }
                  />
                </TableCell>
              </TableRow>
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
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-[11px] font-medium"
              >
                Xem tất cả →
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <RoutePermissionGate route="/manage/iqc">
              <DropdownMenuLinkItem
                to="/manage/iqc"
                search={{ page: 1, limit: 10 }}
              >
                Xem IQC
              </DropdownMenuLinkItem>
            </RoutePermissionGate>
            <RoutePermissionGate route="/manage/oqc">
              <DropdownMenuLinkItem
                to="/manage/oqc"
                search={{ page: 1, limit: 10 }}
              >
                Xem OQC
              </DropdownMenuLinkItem>
            </RoutePermissionGate>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
