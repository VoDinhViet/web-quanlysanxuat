import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Plus, Ruler } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  const table = useTable({
    data: rows,
    columns: unitColumns,
    features: appTableFeatures,
  })

  return (
    <div
      className={cn(
        "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {rows.length === 0 ? (
        <TableEmpty
          icon={Ruler}
          title="Chưa có đơn vị tính nào"
          description="Bắt đầu bằng cách thêm đơn vị tính đầu tiên vào danh mục của bạn."
          action={
            <PermissionGate permission="items:create">
              <CreateUnitDialog
                trigger={
                  <Button size="sm" className="text-xs">
                    <Plus className="size-4" />
                    Thêm đơn vị tính
                  </Button>
                }
              />
            </PermissionGate>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách đơn vị tính">
            <TableHeader
              columns={table.getFlatHeaders()}
              className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45"
            >
              {(header) => (
                <TableHead
                  id={header.id}
                  isRowHeader={header.index === 0}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )}
            </TableHeader>
            <TableBody items={table.getRowModel().rows}>
              {(row) => (
                <TableRow
                  id={row.id}
                  className="h-16 bg-card hover:bg-muted/25"
                  columns={row.getVisibleCells()}
                >
                  {(cell) => (
                    <TableCell
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
