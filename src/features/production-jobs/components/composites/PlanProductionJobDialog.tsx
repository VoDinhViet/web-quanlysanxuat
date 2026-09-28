import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  FileText,
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
import { Input } from "@/components/ui/input"
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
import { productionJobOperationsQueryOptions } from "@/features/production-jobs/api/options"
import { useUpdateProductionJobPlan } from "@/features/production-jobs/api"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type PlanProductionJobDialogProps = {
  job: ProductionJobDetail
  trigger: ReactElement
}

type OperationPlanRow = {
  id: string
  name: string
  code: string
  bomItemCode: string
  leadtime: number
  dueDate: string // yyyy-MM-dd
}

/**
 * Thêm số ngày làm việc vào ngày bắt đầu (bỏ qua Chủ nhật - weekday === 7).
 */
function addWorkingDays(startDate: DateTime, days: number): DateTime {
  let current = startDate
  let added = 0
  const targetDays = Math.max(1, days)
  while (added < targetDays) {
    current = current.plus({ days: 1 })
    if (current.weekday !== 7) {
      added++
    }
  }
  return current
}

/**
 * Đếm số ngày làm việc giữa 2 ngày (bỏ qua Chủ nhật).
 */
function countWorkingDays(startDate: DateTime, endDate: DateTime): number {
  if (endDate <= startDate) return 1
  let current = startDate
  let count = 0
  while (current < endDate) {
    current = current.plus({ days: 1 })
    if (current.weekday !== 7) {
      count++
    }
  }
  return Math.max(1, count)
}

export function PlanProductionJobDialog({
  job,
  trigger,
}: PlanProductionJobDialogProps) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<OperationPlanRow[]>([])

  const operationsQuery = useQuery({
    ...productionJobOperationsQueryOptions(job.id),
    enabled: open,
  })

  const { mutate: savePlan, isPending: isSaving } = useUpdateProductionJobPlan()

  // Ngày bắt đầu tính leadtime: ưu tiên ngày đặt hàng (orderDate) -> ngày bắt đầu job -> hôm nay
  const startDate = useMemo(() => {
    if (job.order.orderDate) {
      return DateTime.fromISO(job.order.orderDate).startOf("day")
    }
    if (job.startedAt) {
      return DateTime.fromISO(job.startedAt).startOf("day")
    }
    return DateTime.now().startOf("day")
  }, [job.order.orderDate, job.startedAt])

  // Khởi tạo danh sách công đoạn khi query có dữ liệu
  useEffect(() => {
    if (!open || !operationsQuery.data) return

    const flatOps = operationsQuery.data.flatMap((group) =>
      group.operations.map((op) => ({
        id: op.id,
        name: op.name,
        code: op.code,
        bomItemCode: group.code,
        dueDate: op.dueDate,
      }))
    )

    let prevDate = startDate
    const initialRows: OperationPlanRow[] = flatOps.map((op) => {
      let dueDateStr: string
      let leadtime: number

      if (op.dueDate) {
        const opDue = DateTime.fromISO(op.dueDate).startOf("day")
        dueDateStr = opDue.toFormat("yyyy-MM-dd")
        leadtime = countWorkingDays(prevDate, opDue)
        prevDate = opDue
      } else {
        leadtime = 1
        prevDate = addWorkingDays(prevDate, leadtime)
        dueDateStr = prevDate.toFormat("yyyy-MM-dd")
      }

      return {
        id: op.id,
        name: op.name,
        code: op.code,
        bomItemCode: op.bomItemCode,
        leadtime,
        dueDate: dueDateStr,
      }
    })

    setRows(initialRows)
  }, [open, operationsQuery.data, startDate])

  // Khi thay đổi Leadtime: tính lại dueDate của dòng này và cascade cho các dòng sau
  const handleLeadtimeChange = (index: number, newLeadtime: number) => {
    const validLeadtime = Math.max(1, newLeadtime)
    setRows((prev) => {
      const next = [...prev]
      let currentPrevDate =
        index === 0
          ? startDate
          : DateTime.fromISO(next[index - 1].dueDate).startOf("day")

      next[index] = {
        ...next[index],
        leadtime: validLeadtime,
      }

      for (let i = index; i < next.length; i++) {
        const computedDueDate = addWorkingDays(currentPrevDate, next[i].leadtime)
        next[i] = {
          ...next[i],
          dueDate: computedDueDate.toFormat("yyyy-MM-dd"),
        }
        currentPrevDate = computedDueDate
      }

      return next
    })
  }

  // Khi thay đổi DatePicker: tính lại Leadtime của dòng này và cascade cho các dòng sau
  const handleDueDateChange = (index: number, newDueDateStr: string) => {
    if (!newDueDateStr) return
    setRows((prev) => {
      const next = [...prev]
      const currentPrevDate =
        index === 0
          ? startDate
          : DateTime.fromISO(next[index - 1].dueDate).startOf("day")
      const newDueDate = DateTime.fromISO(newDueDateStr).startOf("day")
      const newLeadtime = countWorkingDays(currentPrevDate, newDueDate)

      next[index] = {
        ...next[index],
        dueDate: newDueDateStr,
        leadtime: newLeadtime,
      }

      let cascadePrevDate = newDueDate
      for (let i = index + 1; i < next.length; i++) {
        const computedDueDate = addWorkingDays(cascadePrevDate, next[i].leadtime)
        next[i] = {
          ...next[i],
          dueDate: computedDueDate.toFormat("yyyy-MM-dd"),
        }
        cascadePrevDate = computedDueDate
      }

      return next
    })
  }

  const handleSave = () => {
    if (!rows.length) return
    savePlan(
      {
        productionJobId: job.id,
        operations: rows.map((r) => ({
          id: r.id,
          dueDate: r.dueDate,
        })),
      },
      {
        onSuccess: () => setOpen(false),
      }
    )
  }

  // So sánh ngày hoàn thành dự kiến cuối cùng với ngày giao hàng của đơn
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Lập kế hoạch sản xuất
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 3 Thẻ thông tin PO, Ngày đặt hàng, Ngày giao hàng */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/20">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100/80 text-primary dark:bg-sky-900/60">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">PO</div>
                <div className="truncate font-mono text-sm font-bold text-foreground">
                  {job.order.buyerPoNo ?? job.order.code}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/20">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100/80 text-primary dark:bg-sky-900/60">
                <Calendar className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Ngày đặt hàng</div>
                <div className="text-sm font-bold text-foreground">
                  {job.order.orderDate
                    ? DateTime.fromISO(job.order.orderDate).toFormat("dd/MM/yyyy")
                    : "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/20">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100/80 text-primary dark:bg-sky-900/60">
                <Truck className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Ngày giao hàng</div>
                <div className="text-sm font-bold text-foreground">
                  {job.order.dueDate
                    ? DateTime.fromISO(job.order.dueDate).toFormat("dd/MM/yyyy")
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Banner thông báo */}
          <div className="flex items-center gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs font-medium text-sky-800 dark:border-sky-800/80 dark:bg-sky-950/30 dark:text-sky-300">
            <Info className="size-4 shrink-0" />
            <span>
              Hệ thống tự động tính hạn hoàn thành theo Leadtime từng công đoạn và không tính Chủ nhật.
            </span>
          </div>

          {/* Bảng danh sách công đoạn */}
          {operationsQuery.isPending ? (
            <TableQueryLoading rows={5} />
          ) : operationsQuery.isError ? (
            <TableQueryError
              error={operationsQuery.error.message}
              onRetry={() => void operationsQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Không có công đoạn nào trong Job này.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <Table>
                <TableHeader className="bg-muted/40 font-semibold text-muted-foreground">
                  <TableRow>
                    <TableHead className="w-14 text-center font-bold text-foreground">
                      STT
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      CÔNG ĐOẠN
                    </TableHead>
                    <TableHead className="w-36 text-center font-bold text-foreground">
                      LEADTIME (NGÀY)
                    </TableHead>
                    <TableHead className="w-44 text-center font-bold text-foreground">
                      HẠN HOÀN THÀNH
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">
                          {row.name.toUpperCase()}
                        </div>
                        {row.bomItemCode ? (
                          <div className="text-xs text-muted-foreground">
                            {row.bomItemCode}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div className="relative flex items-center">
                            <Input
                              type="number"
                              min={1}
                              value={row.leadtime}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10)
                                if (!isNaN(val) && val >= 1) {
                                  handleLeadtimeChange(index, val)
                                }
                              }}
                              className="h-8 w-24 pr-7 text-center font-medium [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <div className="absolute right-1 flex flex-col">
                              <button
                                type="button"
                                className="p-0.5 text-[10px] leading-3 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  handleLeadtimeChange(index, row.leadtime + 1)
                                }
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={row.leadtime <= 1}
                                className="p-0.5 text-[10px] leading-3 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                onClick={() =>
                                  handleLeadtimeChange(
                                    index,
                                    Math.max(1, row.leadtime - 1)
                                  )
                                }
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          value={row.dueDate}
                          onChange={(newDate) => handleDueDateChange(index, newDate)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Chú thích dưới bảng */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>Chủ nhật không tính vào Leadtime.</span>
          </div>

          {/* Footer cảnh báo / thông tin hạn giao hàng */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                Hạn giao hàng:
              </span>
              <span className="text-lg font-bold text-primary">
                {orderDueDate ? orderDueDate.toFormat("dd/MM/yyyy") : "—"}
              </span>
            </div>

            {isLate ? (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-3 dark:border-rose-900/60 dark:bg-rose-950/30 sm:max-w-md">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-destructive">
                    CẢNH BÁO: Kế hoạch dự kiến hoàn thành{" "}
                    {finalPlannedDueDate?.toFormat("dd/MM/yyyy")}, trễ {daysDiff}{" "}
                    ngày so với hạn giao hàng.
                  </div>
                  <div className="text-muted-foreground">
                    Bạn vẫn có thể tiếp tục lập kế hoạch.
                  </div>
                </div>
              </div>
            ) : finalPlannedDueDate ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Kế hoạch dự kiến hoàn thành {finalPlannedDueDate.toFormat("dd/MM/yyyy")} (đáp ứng hạn giao).
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || rows.length === 0}
          >
            {isSaving ? "Đang lưu..." : "Tiếp tục lập kế hoạch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
