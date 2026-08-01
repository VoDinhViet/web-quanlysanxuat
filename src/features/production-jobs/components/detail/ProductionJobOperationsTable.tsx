import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { OperationType } from "@/lib/types/operation.type"
import type { ProductionJobStep } from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 4

type ProductionJobOperationsTableProps = {
  steps: ProductionJobStep[]
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

// Danh sách công đoạn thật (GET /production-jobs/:jobId/steps), theo thứ tự sortOrder — không
// còn gộp theo Part hay tách 2 bảng trong-xưởng/gia công-ngoài như bản mock cũ, vì endpoint không
// có khái niệm Part. Cột SL kế hoạch/tiến độ/trạng thái của bản mock cũ không có nguồn dữ liệu
// nào — xem cảnh báo ở ProductionJobOperationsTab.tsx.
export function ProductionJobOperationsTable({
  steps,
}: ProductionJobOperationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
          <TableHead className="w-16 font-bold text-foreground">STT</TableHead>
          <TableHead className="min-w-48 font-bold text-foreground">
            CÔNG ĐOẠN
          </TableHead>
          <TableHead className="w-36 font-bold text-foreground">LOẠI</TableHead>
          <TableHead className="min-w-40 font-bold text-foreground">
            GHI CHÚ
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {steps.length === 0 ? (
          <TableEmptyRow
            colSpan={COLUMN_COUNT}
            message="Chưa có công đoạn nào."
          />
        ) : (
          steps.map((step, index) => (
            <TableRow key={step.id} className="h-14 bg-card hover:bg-muted/20">
              <TableCell className="font-mono text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {step.operation.name}{" "}
                <span className="font-mono text-xs text-muted-foreground">
                  ({step.operation.code})
                </span>
              </TableCell>
              <TableCell>
                <OperationTypeBadge type={step.operation.type} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {step.note ?? "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
