import { Link } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { operationColumns } from "@/features/operations/components/OperationsTableColumns"
import { cn } from "@/lib/utils"
import type { OperationDetail } from "@/lib/types/operation.type"

type OperationsTableProps = {
  rows: OperationDetail[]
  isPending: boolean
}

// Bảng danh sách công đoạn — không phân trang, vì GET /operations trả cả danh mục (không quá vài
// chục dòng) chứ không phải offset/limit như các danh sách khác, cùng khuôn RolesTable.
export function OperationsTable({ rows, isPending }: OperationsTableProps) {
  const table = useReactTable({
    data: rows,
    columns: operationColumns,
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
          icon={Wrench}
          title="Chưa có công đoạn nào"
          description="Bắt đầu bằng cách thêm công đoạn đầu tiên vào danh mục của bạn."
          action={
            <RoutePermissionGate route="/manage/operations/create">
              <Button asChild size="sm" className="text-xs">
                <Link to="/manage/operations/create">
                  <Plus className="size-4" />
                  Tạo công đoạn
                </Link>
              </Button>
            </RoutePermissionGate>
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
        </div>
      )}
    </div>
  )
}
