import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
  const table = useReactTable({
    data: rows,
    columns: unitColumns,
    getCoreRowModel: getCoreRowModel(),
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
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-12 hover:bg-muted/45"
                >
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
    </div>
  )
}
