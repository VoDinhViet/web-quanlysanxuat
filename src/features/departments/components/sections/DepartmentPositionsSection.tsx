import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { AddCircle, Magnifier } from "@solar-icons/react"
import { IdCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Surface } from "@/components/shared/layouts/Surface"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { CreatePositionDialog } from "@/features/departments/components/composites/CreatePositionDialog"
import { departmentPositionColumns } from "@/features/departments/components/composites/DepartmentPositionsTableColumns"
import { positionOptionsQueryOptions } from "@/features/positions/api"

type DepartmentPositionsSectionProps = {
  departmentId: string
}

export function DepartmentPositionsSection({
  departmentId,
}: DepartmentPositionsSectionProps) {
  const [q, setQ] = useState("")
  const positionsQuery = useQuery(positionOptionsQueryOptions(departmentId))

  const positions = positionsQuery.data ?? []
  const normalizedQ = q.trim().toLowerCase()
  const rows = normalizedQ
    ? positions.filter(
        (position) =>
          position.code.toLowerCase().includes(normalizedQ) ||
          position.name.toLowerCase().includes(normalizedQ)
      )
    : positions

  const table = useTable({
    data: rows,
    columns: departmentPositionColumns,
    features: appTableFeatures,
  })

  return (
    <Surface>
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Chức vụ trong phòng ban
          </h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
            {positions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              className="h-8 w-72 pr-8 text-xs placeholder:text-muted-foreground/75"
              placeholder="Tìm chức vụ..."
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
            <Magnifier className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <PermissionGate permission="positions:create">
            <CreatePositionDialog
              departmentId={departmentId}
              trigger={
                <Button size="sm" className="text-xs">
                  <AddCircle className="size-4" />
                  Thêm chức vụ
                </Button>
              }
            />
          </PermissionGate>
        </div>
      </div>

      {positionsQuery.isPending ? (
        <TableQueryLoading rows={3} />
      ) : positionsQuery.isError ? (
        <TableQueryError
          error={positionsQuery.error.message}
          onRetry={() => void positionsQuery.refetch()}
        />
      ) : rows.length === 0 ? (
        <TableEmpty
          icon={IdCard}
          title={
            positions.length === 0
              ? "Chưa có chức vụ nào"
              : "Không tìm thấy chức vụ phù hợp"
          }
          description={
            positions.length === 0
              ? "Thêm chức vụ đầu tiên cho phòng ban này để bắt đầu phân công nhân sự."
              : undefined
          }
          className="border-0"
        />
      ) : (
        <div className="overflow-x-auto">
          <Table aria-label="Danh sách chức vụ trong phòng ban">
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
                <TableRow
                  key={row.id}
                  className="h-16 bg-card hover:bg-muted/25"
                >
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Surface>
  )
}
