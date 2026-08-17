import { Fragment } from "react"
import { DateTime } from "luxon"
import { Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { ProductionJobOperationCompletedQuantityCell } from "@/features/production-jobs/components/detail/ProductionJobOperationCompletedQuantityCell"
import type { ProductionJobBomRow } from "@/features/production-jobs/components/detail/ProductionJobBomTab"
import { OperationType } from "@/lib/types/operation.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const columnCount = 4

type ProductionJobBomTableProps = {
  rows: ProductionJobBomRow[]
  productionJobId: string
  canEdit: boolean
}

function OperationTypeBadge({ type }: { type: OperationType }) {
  const isInhouse = type === OperationType.INHOUSE

  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap",
        isInhouse
          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isInhouse
            ? "bg-blue-500 dark:bg-blue-400"
            : "bg-amber-500 dark:bg-amber-400"
        )}
      />
      {isInhouse ? "Trong xưởng" : "Gia công ngoài"}
    </Badge>
  )
}

// One BOM node's group header — a generic icon (the Job BOM API carries no image field, unlike
// the product-structure BOM) + code/name snapshot + this node's own completion count, ahead of
// its operation rows below. The count gives an otherwise mostly-empty full-width row a real job:
// SL kế hoạch itself already repeats on every operation row underneath, so it isn't repeated here.
function BomNodeHeaderRow({ row }: { row: ProductionJobBomRow }) {
  const completed = row.node.operations.filter(
    (operation) => operation.completedQuantity >= row.node.plannedQuantity
  ).length
  const total = row.node.operations.length

  return (
    <TableRow className="h-14 bg-muted/10 hover:bg-muted/15">
      <TableCell colSpan={columnCount} className="py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
            <Package className="size-4" />
          </div>
          <span className="font-mono font-semibold text-foreground">
            {row.node.code}
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="font-semibold text-foreground">{row.node.name}</span>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {completed}/{total} hoàn thành
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}

// Cây BOM của Job (GET /production-jobs/:jobId/bom), nhóm theo từng node BOM — mỗi node có công
// đoạn as-used hiện một khối header (code/tên + SL hoàn thành của riêng node) rồi tới các dòng
// công đoạn của riêng nó, theo sortOrder. STT (vd "1.1") + Loại + tên công đoạn gộp chung 1 cột —
// đánh phẳng theo thứ tự node có công đoạn (không theo path phân cấp của cây BOM), cùng cách bản
// mock đầu tiên của repo này đã dựng (xem ProductionJobBomTab.tsx) — để nhường bề rộng cho 3 cột
// dữ liệu chính (SL kế hoạch/SL hoàn thành/Ngày hoàn thành). Node không có công đoạn (phần lớn là
// MATERIAL) bị bỏ qua. Gộp 1 bảng, phân biệt Trong xưởng/Gia công ngoài bằng badge "Loại" thay vì
// 2 bảng riêng — 1 node có thể có cả 2 loại công đoạn.
export function ProductionJobBomTable({
  rows,
  productionJobId,
  canEdit,
}: ProductionJobBomTableProps) {
  const rowsWithOperations = rows.filter(
    (row) => row.node.operations.length > 0
  )

  return (
    <Table>
      <TableHeader>
        <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
          <TableHead className="min-w-64 font-bold text-foreground">
            CÔNG ĐOẠN
          </TableHead>
          <TableHead className="w-28 text-center font-bold text-foreground">
            SL KẾ HOẠCH
          </TableHead>
          <TableHead className="w-28 text-center font-bold text-foreground">
            SL HOÀN THÀNH
          </TableHead>
          <TableHead className="w-32 text-center font-bold text-foreground">
            NGÀY HOÀN THÀNH
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rowsWithOperations.length === 0 ? (
          <TableEmpty colSpan={columnCount} title="Chưa có công đoạn nào." />
        ) : (
          rowsWithOperations.map((row, groupIndex) => (
            <Fragment key={row.node.id}>
              <BomNodeHeaderRow row={row} />
              {row.node.operations.map((operation, operationIndex) => (
                <TableRow
                  key={operation.id}
                  className="h-16 bg-card hover:bg-muted/20"
                >
                  <TableCell className="py-3">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {groupIndex + 1}.{operationIndex + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-foreground">
                            {operation.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            ({operation.code})
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <OperationTypeBadge type={operation.type} />
                          {operation.note ? (
                            <span className="text-[10px] text-muted-foreground">
                              {operation.note}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-foreground tabular-nums">
                    {quantityFormatter.format(row.node.plannedQuantity)}
                  </TableCell>
                  <TableCell>
                    <ProductionJobOperationCompletedQuantityCell
                      productionJobId={productionJobId}
                      operation={operation}
                      planned={row.node.plannedQuantity}
                      canEdit={canEdit}
                    />
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {operation.completedDate === null
                      ? "—"
                      : DateTime.fromISO(operation.completedDate).toFormat(
                          "dd/MM/yyyy"
                        )}
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))
        )}
      </TableBody>
    </Table>
  )
}
