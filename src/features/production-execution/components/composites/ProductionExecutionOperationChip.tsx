import { Radio } from "@base-ui/react/radio"
import { CheckCircle, Layers } from "@solar-icons/react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import type { ProductionExecutionOperation } from "@/lib/types/production-job.type"

type OperationChipShellProps = {
  value: string
  isChecked: boolean
  leading: ReactNode
  title: string
  jobCount: number
  overdueCount: number
  inProgressCount: number
}

// Thẻ nhỏ chọn công đoạn: [số thứ tự/icon] tên + số liệu, dấu check khi được chọn. Cả chip
// công đoạn lẫn chip "Tất cả công đoạn" dùng lại khung này.
function OperationChipShell({
  value,
  isChecked,
  leading,
  title,
  jobCount,
  overdueCount,
  inProgressCount,
}: OperationChipShellProps) {
  return (
    <Radio.Root
      value={value}
      className={cn(
        "flex min-w-44 cursor-pointer items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
        isChecked &&
          "border-primary bg-primary/5 ring-1 ring-primary hover:bg-primary/5"
      )}
    >
      <span
        className={cn(
          "flex min-w-5 shrink-0 items-center justify-center font-mono text-xs font-semibold text-muted-foreground tabular-nums",
          isChecked && "text-primary"
        )}
      >
        {leading}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="max-w-40 truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {jobCount} job
          {inProgressCount > 0 && ` · ${inProgressCount} đang chạy`}
          {overdueCount > 0 && (
            <span className="font-medium text-destructive">
              {` · ${overdueCount} quá hạn`}
            </span>
          )}
        </span>
      </span>
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center",
          isChecked ? "text-primary" : "invisible"
        )}
      >
        <CheckCircle weight="Bold" className="size-4" />
      </span>
    </Radio.Root>
  )
}

type OperationChipProps = {
  operation: ProductionExecutionOperation
  position: number
  isChecked: boolean
}

export function OperationChip({
  operation,
  position,
  isChecked,
}: OperationChipProps) {
  return (
    <OperationChipShell
      value={operation.operationId}
      isChecked={isChecked}
      leading={String(position).padStart(2, "0")}
      title={operation.name}
      jobCount={operation.jobCount}
      inProgressCount={operation.inProgressCount}
      overdueCount={operation.overdueCount}
    />
  )
}

type AllOperationsChipProps = {
  value: string
  operations: ProductionExecutionOperation[]
  isChecked: boolean
}

// Chip đầu tiên "Tất cả công đoạn": cộng số liệu của mọi chip. Số job là số dòng (Job × công đoạn)
// — đúng bằng tổng bảng khi chọn chip này, nên một Job nhiều công đoạn được đếm mỗi công đoạn một lần.
export function AllOperationsChip({
  value,
  operations,
  isChecked,
}: AllOperationsChipProps) {
  const sum = (pick: (item: ProductionExecutionOperation) => number) =>
    operations.reduce((total, item) => total + pick(item), 0)

  return (
    <OperationChipShell
      value={value}
      isChecked={isChecked}
      leading={<Layers className="size-4" />}
      title="Tất cả công đoạn"
      jobCount={sum((item) => item.jobCount)}
      inProgressCount={sum((item) => item.inProgressCount)}
      overdueCount={sum((item) => item.overdueCount)}
    />
  )
}
