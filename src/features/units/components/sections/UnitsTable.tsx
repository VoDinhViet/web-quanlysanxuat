import { useState } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { AddCircle, Ruler } from "@solar-icons/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import type { PageSize } from "@/components/shared/composites/Pagination"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { CreateUnitDialog } from "@/features/units/components/composites/CreateUnitDialog"
import { unitColumns } from "@/features/units/components/composites/UnitsTableColumns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { UnitDetail } from "@/lib/types/unit.type"

type UnitsTableProps = {
  rows: UnitDetail[]
  isPending: boolean
}

// Bảng danh sách đơn vị tính — không phân trang, vì GET /units trả cả danh mục (không quá vài chục
// dòng) chứ không phải offset/limit như các danh sách khác.
export function UnitsTable({ rows, isPending }: UnitsTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)

  // Clamp so deleting the last row of the last page (or a narrower filter) doesn't strand the
  // user on an empty page.
  const lastPage = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, lastPage)
  const pageRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const table = useTable({
    data: pageRows,
    columns: unitColumns,
    features: appTableFeatures,
  })

  return (
    <div
      className={cn(
        "min-w-0 flex-1 transition-opacity",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {rows.length === 0 ? (
        <div className="p-4 sm:p-5">
          <TableEmpty
            icon={Ruler}
            title="Chưa có đơn vị tính nào"
            description="Bắt đầu bằng cách thêm đơn vị tính đầu tiên vào danh mục của bạn."
            action={
              <PermissionGate permission="items:create">
                <CreateUnitDialog
                  trigger={
                    <Button size="sm" className="text-xs">
                      <AddCircle className="size-4" />
                      Thêm đơn vị tính
                    </Button>
                  }
                />
              </PermissionGate>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto bg-card">
          <Table aria-label="Danh sách đơn vị tính">
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
                  className="h-14 bg-card hover:bg-muted/25"
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Tổng {rows.length} đơn vị tính
            </p>
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={rows.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
