import { Fragment } from "react"
import { Link, useParams } from "@tanstack/react-router"
import { SendSquare } from "@solar-icons/react"
import { DateTime } from "luxon"
import { Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ProductionJobOperationCompletedQuantityCell } from "@/features/production-jobs/components/detail/ProductionJobOperationCompletedQuantityCell"
import type {
  ProductionJobBomItem,
  ProductionJobOperation,
} from "@/lib/types/production-job.type"
import { OperationType } from "@/lib/types/operation.type"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"
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

// Exported alongside the label/description maps below so ProductionJobOperationsLegend.tsx can
// reuse the exact same colors/threshold wording instead of re-deriving them — the legend must
// never drift from what the badge actually renders.
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

// The numeric threshold each status above actually maps to — spelled out for the legend, not
// shown on the badge itself (the badge only has room for `label`).
export const operationProgressStatusDescriptions: Record<
  OperationProgressStatus,
  string
> = {
  NOT_STARTED: "SL hoàn thành = 0",
  IN_PROGRESS: "SL hoàn thành lớn hơn 0 và nhỏ hơn SL kế hoạch",
  COMPLETED: "SL hoàn thành đạt đủ SL kế hoạch — Ngày hoàn thành tự điền",
}

// `completedDate` được server set đúng lúc `completedQuantity` đạt `plannedQuantity` (chốt E088)
// nên dùng thẳng nó cho trạng thái "Hoàn thành" thay vì so sánh lại 2 số — cùng cách
// PartCompletionBadge bên dưới đang làm.
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

type ProductionJobOperationsTableProps = {
  groups: ProductionJobBomItem[]
  productionJobId: string
  canEdit: boolean
  outsourceableByOperationId: Map<string, OutsourceableOperation>
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

// SL đã gửi/còn được phép gửi gia công ngoài — không có trên chính DTO này (Production không
// ghi/biết gì về OS-OUT), Tab ghép sẵn từ route popup OS-OUT rồi truyền xuống dạng Map theo
// `productionJobOperationId`. Trống nếu chưa từng gửi (chưa có dòng OS-OUT nào) — coi như còn
// nguyên định mức.
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

// Điều hướng thật sang wizard tạo OS-OUT có sẵn (/manage/outsourcing-orders/create), lọc sẵn
// đúng Job (và Công đoạn nếu còn liên kết catalog — operationId có thể null nếu snapshot mất
// liên kết) ở bước chọn — Production không tự tạo phiếu OS-OUT (docs/domains/production.md).
// Chỉ hiện với công đoạn Gia công ngoài; ẩn hẳn nếu người dùng không có quyền outsourcing:create.
// Khoá nút (kèm tooltip) khi đã gửi đủ định mức (`remainingQuantity <= 0`, đọc từ cùng Map dùng
// cho cột SL ĐÃ GỬI) — chưa từng gửi (không có trong Map) coi như còn nguyên định mức, vẫn bấm
// được. `productionJobId` đọc thẳng qua useParams (route param sẵn có của trang) thay vì nhận qua
// prop — cùng idiom PurchaseRequestItemCells.tsx đọc purchaseRequestId.
function OperationSendActionCell({
  operation,
  outsourceableByOperationId,
}: {
  operation: ProductionJobOperation
  outsourceableByOperationId: Map<string, OutsourceableOperation>
}) {
  const { productionJobId } = useParams({
    from: "/(authed)/manage_/production-jobs_/$productionJobId",
  })

  if (operation.type !== OperationType.OUTSOURCE) return null

  const outsourceable = outsourceableByOperationId.get(operation.id)
  const isFullySent =
    outsourceable !== undefined && outsourceable.remainingQuantity <= 0

  const button = (
    <Button
      type="button"
      asChild={!isFullySent}
      disabled={isFullySent}
      // Đồng bộ màu amber với badge LOẠI "Gia công ngoài" ở trên — nhận ra ngay nút này thuộc
      // về đúng loại công đoạn nào, thay vì màu mặc định như mọi nút khác.
      className={cn(
        !isFullySent &&
          "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
      )}
    >
      {isFullySent ? (
        <>
          <SendSquare className="size-3.5" />
          Gửi gia công ngoài
        </>
      ) : (
        <Link
          to="/manage/outsourcing-orders/create"
          search={
            operation.operationId
              ? { productionJobId, operationId: operation.operationId }
              : { productionJobId }
          }
        >
          <SendSquare className="size-3.5" />
          Gửi gia công ngoài
        </Link>
      )}
    </Button>
  )

  return (
    <RoutePermissionGate route="/manage/outsourcing-orders/create">
      {isFullySent ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">{button}</span>
          </TooltipTrigger>
          <TooltipContent>Đã gửi đủ định mức</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
    </RoutePermissionGate>
  )
}

// Completion badge counts operations whose `completedDate` is set — the server already sets that
// exactly when `completedQuantity` reaches the node's `plannedQuantity` (E088's own cap), so
// re-deriving the threshold here would just duplicate that check.
function PartCompletionBadge({
  operations,
}: {
  operations: ProductionJobOperation[]
}) {
  const completedCount = operations.filter(
    (operation) => operation.completedDate !== null
  ).length
  const allCompleted =
    operations.length > 0 && completedCount === operations.length

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono",
        allCompleted
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "text-muted-foreground"
      )}
    >
      {completedCount}/{operations.length} hoàn thành
    </Badge>
  )
}

// One BOM node (part)'s group header — a generic icon (this endpoint carries no image field,
// unlike the product-structure BOM) + code/name + completion badge, ahead of its operation rows
// below.
function PartHeaderRow({ part }: { part: ProductionJobBomItem }) {
  return (
    <TableRow className="h-14 bg-muted/10 hover:bg-muted/15">
      <TableCell colSpan={columnCount} className="py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
            <Package className="size-4" />
          </div>
          <span className="font-mono font-semibold text-foreground">
            {part.code}
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="font-semibold text-foreground">{part.name}</span>
          <PartCompletionBadge operations={part.operations} />
        </div>
      </TableCell>
    </TableRow>
  )
}

// Công đoạn as-used của Job (GET /production-jobs/:jobId/operations) — backend đã nhóm sẵn theo
// BOM node (part), mỗi phần tử mảng là một part kèm operations[] của riêng nó (không cần tự dựng
// nhóm ở FE nữa). Mỗi part hiện một khối header (code/tên + badge tiến độ) rồi tới các dòng công
// đoạn của riêng nó, theo thứ tự backend trả (đã sort sortOrder/createdAt). "SL KẾ HOẠCH" đọc
// thẳng `plannedQuantity` — cùng một part thì mọi công đoạn của nó có cùng số; SL hoàn thành nhập
// được tới đúng mức đó (`max`), backend vẫn là chốt chặn thật (E088) lúc lưu. 8 cột tách bạch:
// CÔNG ĐOẠN (STT + tên/mã/ghi chú), LOẠI (Trong xưởng/Gia công ngoài — 1 part có thể có cả 2),
// SL KẾ HOẠCH, SL HOÀN THÀNH, SL ĐÃ GỬI (chỉ dòng Gia công ngoài — ghép từ
// `outsourceableByOperationId`, xem OperationSentQuantityCell), TRẠNG THÁI (Chưa bắt đầu/Đang thực
// hiện/Hoàn thành — suy từ completedQuantity/completedDate, không phải field riêng trên DTO),
// NGÀY HOÀN THÀNH, THAO TÁC (chỉ dòng Gia công ngoài mới có nút Gửi gia công ngoài, khoá khi đã
// gửi đủ định mức, xem OperationSendActionCell). Khung viền `rounded-md border` quanh bảng +
// border-r/border-b có sẵn từ Table primitive, khớp khuôn các bảng khác trong repo
// (`ProductionOrderItemsCard.tsx`, `InventoryIssuesTable.tsx`).
export function ProductionJobOperationsTable({
  groups,
  productionJobId,
  canEdit,
  outsourceableByOperationId,
}: ProductionJobOperationsTableProps) {
  return (
    <div className="p-4 sm:p-5">
      <div className="overflow-x-auto rounded-md border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
              <TableHead className="min-w-56 font-bold text-foreground">
                CÔNG ĐOẠN
              </TableHead>
              <TableHead className="w-32 text-center font-bold text-foreground">
                LOẠI
              </TableHead>
              <TableHead className="w-24 text-center font-bold text-foreground">
                SL KẾ HOẠCH
              </TableHead>
              <TableHead className="w-40 text-center font-bold text-foreground">
                SL HOÀN THÀNH
              </TableHead>
              <TableHead className="w-28 text-center font-bold text-foreground">
                SL ĐÃ GỬI
              </TableHead>
              <TableHead className="w-36 text-center font-bold text-foreground">
                TRẠNG THÁI
              </TableHead>
              <TableHead className="w-32 text-center font-bold text-foreground">
                NGÀY HOÀN THÀNH
              </TableHead>
              <TableHead className="min-w-48 text-center font-bold text-foreground">
                THAO TÁC
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableEmpty
                colSpan={columnCount}
                title="Chưa có công đoạn nào."
              />
            ) : (
              groups.map((part, groupIndex) => (
                <Fragment key={part.id}>
                  <PartHeaderRow part={part} />
                  {part.operations.map((operation, operationIndex) => (
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
                        <ProductionJobOperationCompletedQuantityCell
                          productionJobId={productionJobId}
                          operation={operation}
                          canEdit={canEdit}
                        />
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        <OperationSentQuantityCell
                          operation={operation}
                          outsourceableByOperationId={
                            outsourceableByOperationId
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <OperationStatusBadge operation={operation} />
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {operation.completedDate === null
                          ? "—"
                          : DateTime.fromISO(operation.completedDate).toFormat(
                              "dd/MM/yyyy"
                            )}
                      </TableCell>
                      <TableCell className="text-center">
                        <OperationSendActionCell
                          operation={operation}
                          outsourceableByOperationId={
                            outsourceableByOperationId
                          }
                        />
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
