import { Fragment, useMemo } from "react"
import { ClipboardCheck, SendSquare } from "@solar-icons/react"
import { DateTime } from "luxon"
import { Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, LinkButton } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  JobOperationReportDialog,
  resolveJobOperationReportDisabledReason,
} from "@/components/shared/composites/JobOperationReportDialog"
import { OperationType } from "@/lib/types/operation.type"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"
import type {
  ProductionJobBomItem,
  ProductionJobOperation,
  ProductionJobStatus,
} from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

const columnCount = 8
const quantityFormatter = new Intl.NumberFormat("vi-VN")

export type OperationProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"

type OperationProgressStatusStyle = {
  label: string
  badge: string
  dot: string
}

export const operationProgressStatusStyles: Record<
  OperationProgressStatus,
  OperationProgressStatusStyle
> = {
  NOT_STARTED: {
    label: "Chưa bắt đầu",
    badge: "text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    badge: "bg-info/10 text-info",
    dot: "bg-info",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
}

export const operationProgressStatusDescriptions: Record<
  OperationProgressStatus,
  string
> = {
  NOT_STARTED: "SL hoàn thành = 0",
  IN_PROGRESS: "SL hoàn thành lớn hơn 0 và nhỏ hơn SL kế hoạch",
  COMPLETED: "SL hoàn thành đạt đủ SL kế hoạch — Ngày hoàn thành tự điền",
}

function resolveOperationProgressStatus(
  operation: ProductionJobOperation
): OperationProgressStatus {
  if (operation.completedDate !== null) return "COMPLETED"
  if (operation.completedQuantity > 0) return "IN_PROGRESS"
  return "NOT_STARTED"
}

function OperationStatusBadge({
  operation,
}: {
  operation: ProductionJobOperation
}) {
  const { label, badge, dot } =
    operationProgressStatusStyles[resolveOperationProgressStatus(operation)]

  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", badge)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </Badge>
  )
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

function OperationCompletedQuantityCell({
  operation,
}: {
  operation: ProductionJobOperation
}) {
  return (
    <div className="flex items-center justify-center gap-3 text-center tabular-nums">
      <span className="text-foreground">
        Đạt: {quantityFormatter.format(operation.completedQuantity)}
      </span>
      {operation.rejectedQuantity > 0 && (
        <span className="text-destructive">
          NG: {quantityFormatter.format(operation.rejectedQuantity)}
        </span>
      )}
    </div>
  )
}

function OperationSentQuantityCell({
  operation,
  outsourceableByOperationId,
}: {
  operation: ProductionJobOperation
  outsourceableByOperationId: Map<string, OutsourceableOperation>
}) {
  if (operation.type !== OperationType.OUTSOURCE) return null

  const outsourceable = outsourceableByOperationId.get(operation.id)
  if (!outsourceable) return null

  return (
    <span className="tabular-nums">
      {quantityFormatter.format(outsourceable.sentQuantity)}/
      {quantityFormatter.format(operation.plannedQuantity)}
    </span>
  )
}

function OperationSendActionCell({
  productionJobId,
  operation,
  outsourceableByOperationId,
}: {
  productionJobId: string
  operation: ProductionJobOperation
  outsourceableByOperationId: Map<string, OutsourceableOperation>
}) {
  if (operation.type !== OperationType.OUTSOURCE) return null

  const outsourceable = outsourceableByOperationId.get(operation.id)
  const isFullySent =
    outsourceable !== undefined && outsourceable.remainingQuantity <= 0

  const amberClassName = cn(
    !isFullySent &&
      "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
  )

  const button = isFullySent ? (
    <Button type="button" disabled className={amberClassName}>
      <SendSquare className="size-3.5" />
      Gửi gia công ngoài
    </Button>
  ) : (
    <LinkButton
      to="/manage/outsourcing-orders/create"
      search={
        operation.operationId
          ? { productionJobId, operationId: operation.operationId }
          : { productionJobId }
      }
      className={amberClassName}
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

function BomItemHeaderRow({ bomItem }: { bomItem: ProductionJobBomItem }) {
  return (
    <TableRow
      id={`${bomItem.id}-header`}
      className="h-14 bg-muted/10 hover:bg-muted/15"
    >
      <TableCell colSpan={columnCount} className="py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
            <Package className="size-4" />
          </div>
          <span className="font-mono font-semibold text-foreground">
            {bomItem.code}
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="font-semibold text-foreground">{bomItem.name}</span>
          {bomItem.itemType === "FG" && (
            <Badge
              variant="outline"
              className="bg-violet-50 whitespace-nowrap text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
            >
              <span className="size-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
              Lắp ráp thành phẩm
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

type OperationRowProps = {
  productionJobId: string
  bomItem: ProductionJobBomItem
  operation: ProductionJobOperation
  groupIndex: number
  operationIndex: number
  jobStatus: ProductionJobStatus
  isAssemblyBlocked?: boolean
  outsourceableByOperationId: Map<string, OutsourceableOperation>
}

function OperationRow({
  productionJobId,
  bomItem,
  operation,
  groupIndex,
  operationIndex,
  jobStatus,
  isAssemblyBlocked,
  outsourceableByOperationId,
}: OperationRowProps) {
  const reportDisabledReason = resolveJobOperationReportDisabledReason(
    jobStatus,
    operation.type,
    isAssemblyBlocked
  )

  return (
    <TableRow
      id={operation.id}
      className="h-16 bg-card transition-colors hover:bg-muted/20"
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
      <TableCell>
        <OperationCompletedQuantityCell operation={operation} />
      </TableCell>
      <TableCell className="text-center text-muted-foreground">
        <OperationSentQuantityCell
          operation={operation}
          outsourceableByOperationId={outsourceableByOperationId}
        />
      </TableCell>
      <TableCell className="text-center">
        <OperationStatusBadge operation={operation} />
      </TableCell>
      <TableCell className="text-center text-muted-foreground">
        {operation.completedDate === null
          ? "—"
          : DateTime.fromISO(operation.completedDate).toFormat("dd/MM/yyyy")}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          {operation.type !== OperationType.OUTSOURCE ? (
            <PermissionGate permission="production:update">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <JobOperationReportDialog
                      row={{ bomItem, operation }}
                      disabledReason={reportDisabledReason}
                      trigger={
                        <Button type="button" aria-label="Nhập báo cáo">
                          <ClipboardCheck className="size-4" />
                          <span className="hidden xl:inline">Nhập báo cáo</span>
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent>
                  {reportDisabledReason ?? "Nhập báo cáo hoàn thành"}
                </TooltipContent>
              </Tooltip>
            </PermissionGate>
          ) : null}
          <OperationSendActionCell
            productionJobId={productionJobId}
            operation={operation}
            outsourceableByOperationId={outsourceableByOperationId}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}

type ProductionExecutionOperationsTableProps = {
  productionJobId: string
  groups: ProductionJobBomItem[]
  jobStatus: ProductionJobStatus
  outsourceableByOperationId: Map<string, OutsourceableOperation>
}

export function ProductionExecutionOperationsTable({
  productionJobId,
  groups,
  jobStatus,
  outsourceableByOperationId,
}: ProductionExecutionOperationsTableProps) {
  // Bước Lắp ráp (node itemType = 'FG') chỉ mở khi mọi chi tiết khác (non-FG) đã hoàn thành (E210).
  const hasPendingNonFgOperations = useMemo(
    () =>
      groups.some(
        (item) =>
          item.itemType !== "FG" &&
          item.operations.some((op) => op.completedDate === null)
      ),
    [groups]
  )

  return (
    <div className="overflow-x-auto rounded-md border border-border/50">
      <Table aria-label="Danh sách công đoạn thực hiện sản xuất">
        <TableHeader className="[&>tr]:h-11 [&>tr]:bg-muted/30 [&>tr]:font-semibold [&>tr]:text-muted-foreground [&>tr]:hover:bg-muted/30">
          <TableRow>
            <TableHead
              id="operation"
              className="min-w-56 font-bold text-foreground"
            >
              CÔNG ĐOẠN
            </TableHead>
            <TableHead
              id="type"
              className="w-32 text-center font-bold text-foreground"
            >
              LOẠI
            </TableHead>
            <TableHead
              id="plannedQuantity"
              className="w-24 text-center font-bold text-foreground"
            >
              SL KẾ HOẠCH
            </TableHead>
            <TableHead
              id="completedQuantity"
              className="w-40 text-center font-bold text-foreground"
            >
              SL HOÀN THÀNH
            </TableHead>
            <TableHead
              id="sentQuantity"
              className="w-28 text-center font-bold text-foreground"
            >
              SL ĐÃ GỬI
            </TableHead>
            <TableHead
              id="status"
              className="w-36 text-center font-bold text-foreground"
            >
              TRẠNG THÁI
            </TableHead>
            <TableHead
              id="completedDate"
              className="w-32 text-center font-bold text-foreground"
            >
              NGÀY HOÀN THÀNH
            </TableHead>
            <TableHead
              id="actions"
              className="w-36 text-center font-bold text-foreground"
            >
              THAO TÁC
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <TableEmpty
                  colSpan={columnCount}
                  title="Chưa có công đoạn nào."
                />
              </TableCell>
            </TableRow>
          ) : (
            groups.map((bomItem, groupIndex) => (
              <Fragment key={bomItem.id}>
                <BomItemHeaderRow bomItem={bomItem} />
                {bomItem.operations.map((operation, operationIndex) => (
                  <OperationRow
                    key={operation.id}
                    productionJobId={productionJobId}
                    bomItem={bomItem}
                    operation={operation}
                    groupIndex={groupIndex}
                    operationIndex={operationIndex}
                    jobStatus={jobStatus}
                    isAssemblyBlocked={
                      bomItem.itemType === "FG" && hasPendingNonFgOperations
                    }
                    outsourceableByOperationId={outsourceableByOperationId}
                  />
                ))}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
