import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { AddCircle, Routing } from "@solar-icons/react"

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
        "min-w-0 flex-1 transition-opacity",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {rows.length === 0 ? (
        <div className="p-4 sm:p-5">
          <TableEmpty
            icon={Routing}
            title="Chưa có công đoạn nào"
            description="Bắt đầu bằng cách thêm công đoạn đầu tiên vào danh mục của bạn."
            action={
              <PermissionGate permission="operations:create">
                <CreateOperationDialog
                  trigger={
                    <Button size="sm" className="text-xs">
                      <AddCircle className="size-4" />
                      Tạo công đoạn
                    </Button>
                  }
                />
              </PermissionGate>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto bg-card">
          <Table aria-label="Danh sách công đoạn">
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
                  className="h-12 bg-card hover:bg-muted/25"
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
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Tổng {rows.length} công đoạn
          </p>
        </div>
      )}
    </div>
  )
}
