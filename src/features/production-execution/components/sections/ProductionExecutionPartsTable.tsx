import { ClipboardCheck, SendSquare } from "@solar-icons/react"
import { ClipboardList } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import {
  JobOperationReportDialog,
  resolveJobOperationReportDisabledReason,
} from "@/components/shared/composites/JobOperationReportDialog"
import { formatJobOperationDueDate } from "@/components/shared/composites/JobOperationDueDateCell"
import { ProductionExecutionImageCell } from "@/features/production-execution/components/primitives/ProductionExecutionJobTableCells"
import { OperationType } from "@/lib/types/operation.type"
import type { PartRow } from "@/features/production-execution/constants/production-execution-parts"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"
import type { ProductionJobStatus } from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

const columnCount = 10
const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ProductionExecutionPartsTableProps = {
  productionJobId: string
  rows: PartRow[]
  jobStatus: ProductionJobStatus
  outsourceableByOperationId: Map<string, OutsourceableOperation>
  hasSearchTerm: boolean
}

// Một dòng / Part của công đoạn đang chọn. Bước Lắp ráp (node itemType = 'FG') chỉ mở khi mọi
// chi tiết khác (non-FG) đã hoàn thành (E210) — tính từ chính `rows` (mỗi Part có đúng công
// đoạn đang chọn nên đây là điều kiện trên công đoạn này, không phải toàn routing).
export function ProductionExecutionPartsTable({
  productionJobId,
  rows,
  jobStatus,
  outsourceableByOperationId,
  hasSearchTerm,
}: ProductionExecutionPartsTableProps) {
  const hasPendingNonFgOperations = rows.some(
    ({ bomItem, operation }) =>
      bomItem.itemType !== "FG" && operation.completedDate === null
  )

  return (
    <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
      <Table aria-label="Danh sách chi tiết sản phẩm trong Job">
        <TableHeader className="[&>tr]:h-12 [&>tr]:bg-muted/40 [&>tr]:hover:bg-muted/40">
          <TableRow>
            <TableHead className="w-12 text-center font-bold text-foreground">
              #
            </TableHead>
            <TableHead className="w-20 text-center font-bold text-foreground">
              Hình ảnh
            </TableHead>
            <TableHead className="min-w-32 font-bold text-foreground">
              Mã sản phẩm
            </TableHead>
            <TableHead className="min-w-44 font-bold text-foreground">
              Tên sản phẩm
            </TableHead>
            <TableHead className="w-24 text-center font-bold text-foreground">
              SL KH
            </TableHead>
            <TableHead className="w-32 text-center font-bold text-foreground">
              SL hoàn thành
            </TableHead>
            <TableHead className="w-28 text-center font-bold text-foreground">
              SL không đạt
            </TableHead>
            <TableHead className="w-36 text-center font-bold text-foreground">
              Ngày hoàn thành
            </TableHead>
            <TableHead className="w-36 text-center font-bold text-foreground">
              Hạn hoàn thành
            </TableHead>
            <TableHead className="w-44 text-center font-bold text-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <TableEmpty
                  colSpan={columnCount}
                  icon={ClipboardList}
                  title={
                    hasSearchTerm
                      ? "Không có sản phẩm nào khớp từ khóa."
                      : "Công đoạn này chưa có sản phẩm nào trong Job."
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <PartTableRow
                key={row.operation.id}
                productionJobId={productionJobId}
                row={row}
                index={index}
                jobStatus={jobStatus}
                isAssemblyBlocked={
                  row.bomItem.itemType === "FG" && hasPendingNonFgOperations
                }
                outsourceableByOperationId={outsourceableByOperationId}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

type PartTableRowProps = {
  productionJobId: string
  row: PartRow
  index: number
  jobStatus: ProductionJobStatus
  isAssemblyBlocked: boolean
  outsourceableByOperationId: Map<string, OutsourceableOperation>
}

function PartTableRow({
  productionJobId,
  row,
  index,
  jobStatus,
  isAssemblyBlocked,
  outsourceableByOperationId,
}: PartTableRowProps) {
  const { bomItem, operation } = row
  const outsourceable =
    operation.type === OperationType.OUTSOURCE
      ? outsourceableByOperationId.get(operation.id)
      : undefined

  return (
    <TableRow className="h-16 bg-card hover:bg-muted/25">
      <TableCell className="text-center text-muted-foreground tabular-nums">
        {index + 1}
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <ProductionExecutionImageCell image={bomItem.image} />
        </div>
      </TableCell>
      <TableCell className="font-mono">{bomItem.code}</TableCell>
      <TableCell className="font-medium text-foreground">
        {bomItem.name}
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {quantityFormatter.format(operation.plannedQuantity)}
      </TableCell>
      <TableCell className="text-center tabular-nums">
        <span className="font-semibold text-foreground">
          {quantityFormatter.format(operation.completedQuantity)}
        </span>
        {outsourceable && (
          <p className="text-[11px] text-muted-foreground">
            Đã gửi {quantityFormatter.format(outsourceable.sentQuantity)}/
            {quantityFormatter.format(operation.plannedQuantity)}
          </p>
        )}
      </TableCell>
      <TableCell
        className={cn(
          "text-center tabular-nums",
          operation.rejectedQuantity > 0
            ? "font-semibold text-destructive"
            : "text-muted-foreground"
        )}
      >
        {quantityFormatter.format(operation.rejectedQuantity)}
      </TableCell>
      <TableCell className="text-center text-muted-foreground">
        {formatJobOperationDueDate(operation.completedDate)}
      </TableCell>
      <TableCell className="text-center text-muted-foreground">
        {formatJobOperationDueDate(operation.dueDate)}
      </TableCell>
      <TableCell className="text-center">
        <PartActionCell
          productionJobId={productionJobId}
          row={row}
          jobStatus={jobStatus}
          isAssemblyBlocked={isAssemblyBlocked}
          outsourceable={outsourceable}
        />
      </TableCell>
    </TableRow>
  )
}

type PartActionCellProps = {
  productionJobId: string
  row: PartRow
  jobStatus: ProductionJobStatus
  isAssemblyBlocked: boolean
  outsourceable: OutsourceableOperation | undefined
}

function PartActionCell({
  productionJobId,
  row,
  jobStatus,
  isAssemblyBlocked,
  outsourceable,
}: PartActionCellProps) {
  const { operation } = row

  if (operation.type === OperationType.OUTSOURCE) {
    return (
      <OutsourceSendButton
        productionJobId={productionJobId}
        operationId={operation.operationId}
        isFullySent={
          outsourceable !== undefined && outsourceable.remainingQuantity <= 0
        }
      />
    )
  }

  const disabledReason = resolveJobOperationReportDisabledReason(
    jobStatus,
    operation.type,
    isAssemblyBlocked
  )

  return (
    <PermissionGate permission="production-execution:report">
      <Tooltip>
        <TooltipTrigger
          render={
            <JobOperationReportDialog
              row={row}
              disabledReason={disabledReason}
              trigger={
                <Button type="button" size="sm" className="text-xs">
                  <ClipboardCheck className="size-4" />
                  Cập nhật
                </Button>
              }
            />
          }
        />
        <TooltipContent>
          {disabledReason ?? "Nhập báo cáo hoàn thành"}
        </TooltipContent>
      </Tooltip>
    </PermissionGate>
  )
}

type OutsourceSendButtonProps = {
  productionJobId: string
  operationId: string | null
  isFullySent: boolean
}

function OutsourceSendButton({
  productionJobId,
  operationId,
  isFullySent,
}: OutsourceSendButtonProps) {
  const className = cn(
    "text-xs",
    !isFullySent &&
      "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
  )

  const button = isFullySent ? (
    <Button type="button" size="sm" disabled className={className}>
      <SendSquare className="size-3.5" />
      Gửi gia công ngoài
    </Button>
  ) : (
    <LinkButton
      to="/manage/outsourcing-orders/create"
      search={
        operationId ? { productionJobId, operationId } : { productionJobId }
      }
      size="sm"
      className={className}
    >
      <SendSquare className="size-3.5" />
      Gửi gia công ngoài
    </LinkButton>
  )

  return (
    <RoutePermissionGate route="/manage/outsourcing-orders/create">
      {isFullySent ? (
        <Tooltip>
          <TooltipTrigger
            render={<span className="inline-block">{button}</span>}
          />
          <TooltipContent>Đã gửi đủ định mức</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
    </RoutePermissionGate>
  )
}
