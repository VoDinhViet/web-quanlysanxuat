import { Fragment } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import {
  BomItemHeaderRow,
  OperationTypeBadge,
} from "@/features/production-jobs/components/composites/ProductionJobOperationsTable"
import type { ProductionJobPlanBomItem } from "@/lib/types/production-job.type"

const columnCount = 3
const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ProductionJobPlanOperationsTableProps = {
  groups: ProductionJobPlanBomItem[]
}

// Job PENDING: công đoạn tạm tính từ cấu trúc sản phẩm hiện tại × SL Job, chỉ đọc — báo cáo/gửi
// gia công ngoài/hạn chỉ mở sau "Xác nhận kế hoạch".
export function ProductionJobPlanOperationsTable({
  groups,
}: ProductionJobPlanOperationsTableProps) {
  return (
    <div className="p-4 sm:p-5">
      <div className="overflow-x-auto rounded-md border border-border/50">
        <Table aria-label="Kế hoạch công đoạn">
          <TableHeader className="[&>tr]:h-11 [&>tr]:bg-muted/30 [&>tr]:font-semibold [&>tr]:text-muted-foreground [&>tr]:hover:bg-muted/30">
            <TableRow>
              <TableHead className="min-w-56 font-bold text-foreground">
                CÔNG ĐOẠN
              </TableHead>
              <TableHead className="w-32 text-center font-bold text-foreground">
                LOẠI
              </TableHead>
              <TableHead className="w-28 text-center font-bold text-foreground">
                SL KẾ HOẠCH
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <TableEmpty
                    title="Sản phẩm chưa có công đoạn"
                    description="Thêm công đoạn ở cấu trúc sản phẩm để lên kế hoạch."
                  />
                </TableCell>
              </TableRow>
            ) : (
              groups.map((bomItem, groupIndex) => (
                <Fragment key={bomItem.id}>
                  <BomItemHeaderRow
                    bomItem={bomItem}
                    columnSpan={columnCount}
                  />
                  {bomItem.operations.map((operation, operationIndex) => (
                    <TableRow
                      key={`${operation.code}-${operationIndex}`}
                      className="h-14 bg-card hover:bg-muted/20"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                            {groupIndex + 1}.{operationIndex + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-medium text-foreground">
                              {operation.name}
                            </span>{" "}
                            <span className="font-mono text-xs text-muted-foreground">
                              ({operation.code})
                            </span>
                            {operation.note ? (
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {operation.note}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <OperationTypeBadge type={operation.type} />
                      </TableCell>
                      <TableCell className="text-center text-foreground tabular-nums">
                        {quantityFormatter.format(operation.plannedQuantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
