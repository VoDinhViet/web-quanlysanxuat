import { useMemo } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Package } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildProductionExecutionPartColumns } from "@/features/production-execution/components/composites/ProductionExecutionPartsTableColumns"
import type {
  JobOperationReportRow,
  ProductionJobStatus,
} from "@/lib/types/production-job.type"

type ProductionExecutionPartsTableProps = {
  rows: JobOperationReportRow[]
  jobStatus: ProductionJobStatus
}

// Bảng "DANH SÁCH PART" — mỗi dòng có nút "Nhập báo cáo" mở dialog riêng (xem
// JobOperationReportDialog.tsx), không còn khái niệm "dòng đang chọn" của bản trước (bấm mũi tên →
// cuộn xuống xem form riêng bên dưới bảng).
export function ProductionExecutionPartsTable({
  rows,
  jobStatus,
}: ProductionExecutionPartsTableProps) {
  const columns = useMemo(
    () => buildProductionExecutionPartColumns({ jobStatus }),
    [jobStatus]
  )

  const table = useTable({
    data: rows,
    columns,
    features: appTableFeatures,
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
      <Table aria-label="Danh sách Part">
        <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
<TableRow>
{table.getFlatHeaders().map((header) => (
<TableHead
key={header.id}
className={header.column.columnDef.meta?.headerClassName}
>
{!header.isPlaceholder &&
                flexRender(header.column.columnDef.header, header.getContext())}
</TableHead>
))}
</TableRow>
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
