import { useMemo, useState } from "react"
import { flexRender, useTable } from "@tanstack/react-table"

import { Pagination } from "@/components/shared/composites/Pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildImportDirectColumns } from "@/features/directs/components/composites/ImportDirectsPreviewColumns"
import { appTableFeatures } from "@/lib/table-features"
import type { DirectImportPreviewRow } from "@/lib/types/direct.type"
import { cn } from "@/lib/utils"

type ImportDirectsPreviewTableProps = {
  rows: DirectImportPreviewRow[]
  disabled: boolean
  onEdit: (rowNumber: number) => void
  onDelete: (rowNumber: number) => void
}

export function ImportDirectsPreviewTable({
  rows,
  disabled,
  onEdit,
  onDelete,
}: ImportDirectsPreviewTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const columns = useMemo(
    () => buildImportDirectColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )
  const table = useTable({
    data: pageRows,
    columns,
    features: appTableFeatures,
  })

  return (
    <div
      className={cn("min-w-0", disabled && "pointer-events-none opacity-50")}
    >
      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table aria-label="Danh sách vật tư xem trước">
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
        </Table>
      </div>

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        total={rows.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        className="pt-4"
      />
    </div>
  )
}
