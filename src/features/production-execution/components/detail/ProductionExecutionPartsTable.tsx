import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Package } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { buildProductionExecutionPartColumns } from "@/features/production-execution/components/detail/ProductionExecutionPartsTableColumns"
import type { ProductionExecutionPartRow } from "@/features/production-execution/components/detail/ProductionExecutionPartsTableColumns"

type ProductionExecutionPartsTableProps = {
  rows: ProductionExecutionPartRow[]
  disabledReason: string | null
}

// Bảng "DANH SÁCH PART" — mỗi dòng có nút "Nhập báo cáo" mở dialog riêng (xem
// JobOperationReportDialog.tsx), không còn khái niệm "dòng đang chọn" của bản trước (bấm mũi tên →
// cuộn xuống xem form riêng bên dưới bảng).
export function ProductionExecutionPartsTable({
  rows,
  disabledReason,
}: ProductionExecutionPartsTableProps) {
  const columns = useMemo(
    () => buildProductionExecutionPartColumns({ disabledReason }),
    [disabledReason]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (rows.length === 0) {
    return (
      <TableEmpty
        icon={Package}
        title="Không có Part nào"
        description="Không có Part nào của Job này chạy công đoạn đang chọn."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="h-12 hover:bg-muted/45">
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
            <TableRow key={row.id} className="h-16 bg-card hover:bg-muted/25">
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
  )
}
