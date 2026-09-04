import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Plus, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { CreateOperationDialog } from "@/features/operations/components/composites/CreateOperationDialog"
import { operationColumns } from "@/features/operations/components/composites/OperationsTableColumns"
import { cn } from "@/lib/utils"
import type { OperationDetail } from "@/lib/types/operation.type"

type OperationsTableProps = {
  rows: OperationDetail[]
  isPending: boolean
}

// Bảng danh sách công đoạn — không phân trang, vì GET /operations trả cả danh mục (không quá vài
// chục dòng) chứ không phải offset/limit như các danh sách khác, cùng khuôn RolesTable.
export function OperationsTable({ rows, isPending }: OperationsTableProps) {
  const table = useTable({
    data: rows,
    columns: operationColumns,
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
          icon={Wrench}
          title="Chưa có công đoạn nào"
          description="Bắt đầu bằng cách thêm công đoạn đầu tiên vào danh mục của bạn."
          action={
            <PermissionGate permission="operations:create">
              <CreateOperationDialog
                trigger={
                  <Button size="sm" className="text-xs">
                    <Plus className="size-4" />
                    Tạo công đoạn
                  </Button>
                }
              />
            </PermissionGate>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách công đoạn">
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
                  className="h-14 bg-card hover:bg-muted/25"
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
