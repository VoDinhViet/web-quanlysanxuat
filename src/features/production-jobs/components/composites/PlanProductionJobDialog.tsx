import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Truck,
} from "lucide-react"
import type { ReactElement } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { productionJobPlanGroupOperationsQueryOptions } from "@/features/production-jobs/api/options"
import { useUpdateProductionJobPlan } from "@/features/production-jobs/api"
import { useOperationSchedule } from "@/features/production-jobs/hooks/use-operation-schedule"
import type { OperationScheduleRow } from "@/features/production-jobs/hooks/use-operation-schedule"
import { OperationScheduleTable } from "@/features/production-jobs/components/composites/OperationScheduleTable"
import { cn } from "@/lib/utils"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type PlanProductionJobDialogProps = {
  job: ProductionJobDetail
  trigger: ReactElement
}

export function PlanProductionJobDialog({
  job,
  trigger,
}: PlanProductionJobDialogProps) {
  const [open, setOpen] = useState(false)

  // Lấy danh sách nhóm công đoạn từ API (mỗi công đoạn trong Job hiển thị 1 lần)
  const planQuery = useQuery({
    ...productionJobPlanGroupOperationsQueryOptions(job.id),
    enabled: open,
  })

  const { mutate: savePlan, isPending: isSaving } = useUpdateProductionJobPlan()

  // Ngày bắt đầu: ngày đặt hàng -> ngày bắt đầu job -> hôm nay (định dạng yyyy-MM-dd)
  const startDateStr = useMemo(() => {
    const raw = job.order.orderDate || job.startedAt
    return raw
      ? DateTime.fromISO(raw).toFormat("yyyy-MM-dd")
      : DateTime.now().toFormat("yyyy-MM-dd")
  }, [job.order.orderDate, job.startedAt])

  const {
    schedule,
    setLeadtime,
    setDueDate,
    reorder,
    applySuggestedSequence,
    discardChanges,
  } = useOperationSchedule({
    planOperations: planQuery.data,
    startDateStr,
  })

  const handleSave = () => {
    if (!schedule.length) return
    savePlan(
      {
        productionJobId: job.id,
        operations: schedule.map((r) => ({
          operationIds: r.operationIds,
          dueDate: r.dueDate,
        })),
      },
      {
        onSuccess: () => setOpen(false),
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        discardChanges()
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] overflow-y-auto p-4 sm:max-w-3xl sm:p-6 lg:max-w-4xl">
        <DialogHeader className="gap-1 pb-1">
          <DialogTitle className="text-base font-semibold text-foreground">
            Lập kế hoạch sản xuất
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {job.code} · {job.item.name} (SL: {job.quantity})
          </p>
        </DialogHeader>

        <div className="space-y-3.5">
          {/* 4 Thẻ chỉ số tiến độ trực quan */}
          <PlanJobProgressHeader
            job={job}
            startDateStr={startDateStr}
            schedule={schedule}
          />

          {/* Tiêu đề bảng công đoạn */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-foreground">
              Tiến độ từng công đoạn ({schedule.length})
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <Info className="size-3.5 shrink-0" />
              Kéo thả hàng để đổi thứ tự · Leadtime tự tính bỏ qua Chủ nhật
            </span>
          </div>

          {planQuery.isPending ? (
            <TableQueryLoading rows={5} />
          ) : planQuery.isError ? (
            <TableQueryError
              error={planQuery.error.message}
              onRetry={() => void planQuery.refetch()}
            />
          ) : schedule.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Không có công đoạn nào trong Job này.
            </div>
          ) : (
            <OperationScheduleTable
              schedule={schedule}
              onLeadtimeChange={setLeadtime}
              onDueDateChange={setDueDate}
              onReorder={reorder}
              onApplySuggestedSequence={applySuggestedSequence}
            />
          )}
        </div>

        <DialogFooter className="mt-3 flex flex-col-reverse gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={isSaving || schedule.length === 0}
          >
            {isSaving ? "Đang lưu..." : "Lưu kế hoạch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** 4 Thẻ chỉ số tiến độ trực quan: Bắt đầu, Dự kiến xong, Hạn giao, Đánh giá */
function PlanJobProgressHeader({
  job,
  startDateStr,
  schedule,
}: {
  job: ProductionJobDetail
  startDateStr: string
  schedule: OperationScheduleRow[]
}) {
  const orderDueDate = job.order.dueDate
    ? DateTime.fromISO(job.order.dueDate).startOf("day")
    : null
  const finalPlannedDueDate =
    schedule.length > 0
      ? DateTime.fromISO(schedule[schedule.length - 1].dueDate).startOf("day")
      : null

  const isLate =
    orderDueDate && finalPlannedDueDate && finalPlannedDueDate > orderDueDate
  const daysDiff =
    isLate && orderDueDate && finalPlannedDueDate
      ? Math.round(finalPlannedDueDate.diff(orderDueDate, "days").days)
      : 0

  const totalLeadtime = schedule.reduce((sum, r) => sum + r.leadtime, 0)

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
      {/* 1. Bắt đầu SX */}
      <div className="flex flex-col justify-between rounded-lg border border-border/80 bg-card p-2.5 shadow-xs sm:p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-[11px]">
          <Calendar className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">Bắt đầu</span>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xs font-semibold text-foreground sm:text-sm">
            {DateTime.fromISO(startDateStr).toFormat("dd/MM/yyyy")}
          </div>
          <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
            PO: {job.order.buyerPoNo ?? job.order.code}
          </div>
        </div>
      </div>

      {/* 2. Dự kiến hoàn thành */}
      <div className="flex flex-col justify-between rounded-lg border border-border/80 bg-card p-2.5 shadow-xs sm:p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-[11px]">
          <Clock className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">Dự kiến xong</span>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xs font-semibold text-foreground sm:text-sm">
            {finalPlannedDueDate
              ? finalPlannedDueDate.toFormat("dd/MM/yyyy")
              : "—"}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {totalLeadtime} ngày làm việc
          </div>
        </div>
      </div>

      {/* 3. Hạn giao hàng */}
      <div className="flex flex-col justify-between rounded-lg border border-border/80 bg-card p-2.5 shadow-xs sm:p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-[11px]">
          <Truck className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">Hạn giao</span>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xs font-semibold text-foreground sm:text-sm">
            {orderDueDate ? orderDueDate.toFormat("dd/MM/yyyy") : "—"}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            Theo đơn hàng
          </div>
        </div>
      </div>

      {/* 4. Đánh giá tiến độ */}
      <div
        className={cn(
          "flex flex-col justify-between rounded-lg border p-2.5 shadow-xs transition-colors sm:p-3",
          isLate
            ? "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/15"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        )}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase sm:text-[11px]">
          {isLate ? (
            <AlertTriangle className="size-3.5 shrink-0" />
          ) : (
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <span className="truncate">Tiến độ</span>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xs font-bold sm:text-sm">
            {isLate ? `Trễ ${daysDiff} ngày` : "Kịp hạn giao"}
          </div>
          <div className="mt-0.5 text-[10px] opacity-85">
            {isLate ? "Vượt ngày giao" : "Đạt cam kết"}
          </div>
        </div>
      </div>
    </div>
  )
}
