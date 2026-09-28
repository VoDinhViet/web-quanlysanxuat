import { useEffect, useMemo, useState } from "react"
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
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DatePicker } from "@/components/shared/composites/DatePicker"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { productionJobPlanGroupOperationsQueryOptions } from "@/features/production-jobs/api/options"
import { useUpdateProductionJobPlan } from "@/features/production-jobs/api"
import {
  addWorkDays,
  countWorkDays,
  recalculateSchedule,
} from "@/features/production-jobs/utils/plan-schedule.util"
import { cn } from "@/lib/utils"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type PlanProductionJobDialogProps = {
  job: ProductionJobDetail
  trigger: ReactElement
}

type PlanRow = {
  key: string
  name: string
  code: string
  operationIds: string[]
  bomItemCodes: string[]
  leadtime: number
  dueDate: string // yyyy-MM-dd
}

export function PlanProductionJobDialog({
  job,
  trigger,
}: PlanProductionJobDialogProps) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<PlanRow[]>([])

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

  // Khởi tạo dòng kế hoạch từ API
  useEffect(() => {
    if (!open || !planQuery.data) return

    let prev = startDateStr
    const initialRows: PlanRow[] = planQuery.data.map((item) => {
      let dueDate: string
      let leadtime: number

      if (item.dueDate) {
        dueDate = DateTime.fromISO(item.dueDate).toFormat("yyyy-MM-dd")
        leadtime = countWorkDays(prev, dueDate)
      } else {
        leadtime = 1
        dueDate = addWorkDays(prev, 1)
      }
      prev = dueDate

      return {
        ...item,
        leadtime,
        dueDate,
      }
    })

    setRows(initialRows)
  }, [open, planQuery.data, startDateStr])

  const handleLeadtimeChange = (index: number, newLeadtime: number) => {
    const next = [...rows]
    next[index] = { ...next[index], leadtime: Math.max(1, newLeadtime) }
    setRows(recalculateSchedule(next, startDateStr, index))
  }

  const handleDueDateChange = (index: number, newDueDateStr: string) => {
    if (!newDueDateStr) return
    const prev = index === 0 ? startDateStr : rows[index - 1].dueDate
    const next = [...rows]
    next[index] = {
      ...next[index],
      leadtime: countWorkDays(prev, newDueDateStr),
      dueDate: newDueDateStr,
    }
    setRows(recalculateSchedule(next, startDateStr, index + 1))
  }

  const handleSave = () => {
    if (!rows.length) return
    savePlan(
      {
        productionJobId: job.id,
        operations: rows.map((r) => ({
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
    <Dialog open={open} onOpenChange={setOpen}>
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
            rows={rows}
          />

          {/* Tiêu đề bảng công đoạn */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-foreground">
              Tiến độ từng công đoạn ({rows.length})
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <Info className="size-3.5 shrink-0" />
              Leadtime tự tính bỏ qua Chủ nhật
            </span>
          </div>

          {planQuery.isPending ? (
            <TableQueryLoading rows={5} />
          ) : planQuery.isError ? (
            <TableQueryError
              error={planQuery.error.message}
              onRetry={() => void planQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Không có công đoạn nào trong Job này.
            </div>
          ) : (
            <PlanJobTable
              rows={rows}
              onLeadtimeChange={handleLeadtimeChange}
              onDueDateChange={handleDueDateChange}
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
            disabled={isSaving || rows.length === 0}
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
  rows,
}: {
  job: ProductionJobDetail
  startDateStr: string
  rows: PlanRow[]
}) {
  const orderDueDate = job.order.dueDate
    ? DateTime.fromISO(job.order.dueDate).startOf("day")
    : null
  const finalPlannedDueDate =
    rows.length > 0
      ? DateTime.fromISO(rows[rows.length - 1].dueDate).startOf("day")
      : null

  const isLate =
    orderDueDate && finalPlannedDueDate && finalPlannedDueDate > orderDueDate
  const daysDiff =
    isLate && orderDueDate && finalPlannedDueDate
      ? Math.round(finalPlannedDueDate.diff(orderDueDate, "days").days)
      : 0

  const totalLeadtime = rows.reduce((sum, r) => sum + r.leadtime, 0)

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

/** Bảng danh sách công đoạn với input Leadtime và DatePicker */
function PlanJobTable({
  rows,
  onLeadtimeChange,
  onDueDateChange,
}: {
  rows: PlanRow[]
  onLeadtimeChange: (index: number, val: number) => void
  onDueDateChange: (index: number, dateStr: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border/60">
      <Table aria-label="Kế hoạch công đoạn" className="min-w-[460px]">
        <TableHeader className="[&>tr]:h-11 [&>tr]:bg-muted/30 [&>tr]:font-semibold [&>tr]:text-muted-foreground [&>tr]:hover:bg-muted/30">
          <TableRow>
            <TableHead className="w-10 min-w-10 text-center font-bold text-foreground">
              STT
            </TableHead>
            <TableHead className="min-w-36 font-bold text-foreground">
              CÔNG ĐOẠN
            </TableHead>
            <TableHead className="w-28 min-w-28 text-center font-bold text-foreground">
              LEADTIME (NGÀY)
            </TableHead>
            <TableHead className="w-38 min-w-38 text-center font-bold text-foreground">
              HẠN HOÀN THÀNH
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.key} className="h-14 bg-card hover:bg-muted/20">
              <TableCell className="text-center font-mono text-xs text-muted-foreground tabular-nums">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground sm:text-sm">
                    {row.name}
                  </span>
                  {row.code ? (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      ({row.code})
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <NumericCellInput
                    value={row.leadtime}
                    min={1}
                    onValueChange={(val) => {
                      if (val !== undefined && val >= 1) {
                        onLeadtimeChange(index, val)
                      }
                    }}
                    className="h-8 w-18 text-center text-xs font-medium tabular-nums"
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <div className="w-34">
                    <DatePicker
                      value={row.dueDate}
                      onChange={(newDate) => onDueDateChange(index, newDate)}
                    />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
