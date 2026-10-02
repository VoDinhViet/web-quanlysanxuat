import { Radio } from "@base-ui/react/radio"
import { CheckCircle, Layers } from "@solar-icons/react"
import { sumBy } from "lodash-es"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import type { ProductionExecutionOperation } from "@/lib/types/production-job.type"

type OperationCardShellProps = {
  value: string
  isChecked: boolean
  leading: ReactNode
  title: string
  remainingJobCount: number
  overdueJobCount: number
  inProgressJobCount: number
}

// Thẻ chọn công đoạn: [số thứ tự/icon] tên + số liệu, dấu check khi được chọn. Cả thẻ
// công đoạn lẫn thẻ "Tất cả công đoạn" dùng lại khung này.
function OperationCardShell({
  value,
  isChecked,
  leading,
  title,
  remainingJobCount,
  overdueJobCount,
  inProgressJobCount,
}: OperationCardShellProps) {
  return (
    <Radio.Root
      value={value}
      className={cn(
        "flex h-full min-h-[58px] w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
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
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span
          className="truncate text-sm font-medium text-foreground"
          title={title}
        >
          {title}
        </span>
        <span className="truncate text-xs text-muted-foreground tabular-nums">
          {remainingJobCount} job
          {inProgressJobCount > 0 && ` · ${inProgressJobCount} đang chạy`}
          {overdueJobCount > 0 && (
            <span className="font-medium text-destructive">
              {` · ${overdueJobCount} quá hạn`}
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

type OperationCardProps = {
  operation: ProductionExecutionOperation
  position?: number
  isChecked: boolean
}

export function OperationCard({
  operation,
  position,
  isChecked,
}: OperationCardProps) {
  return (
    <OperationCardShell
      value={operation.operationId}
      isChecked={isChecked}
      leading={
        operation.code ||
        (position !== undefined ? String(position).padStart(2, "0") : "")
      }
      title={operation.name}
      remainingJobCount={operation.remainingJobCount}
      inProgressJobCount={operation.inProgressJobCount}
      overdueJobCount={operation.overdueJobCount}
    />
  )
}

type AllOperationsCardProps = {
  value: string
  operations: ProductionExecutionOperation[]
  isChecked: boolean
}

// Thẻ đầu tiên "Tất cả công đoạn": cộng số liệu của mọi thẻ. Số job là số cặp (Job × công đoạn)
// còn chưa xong, nên một Job nhiều công đoạn được đếm mỗi công đoạn một lần.
export function AllOperationsCard({
  value,
  operations,
  isChecked,
}: AllOperationsCardProps) {
  return (
    <OperationCardShell
      value={value}
      isChecked={isChecked}
      leading={<Layers className="size-4" />}
      title="Tất cả công đoạn"
      remainingJobCount={sumBy(operations, "remainingJobCount")}
      inProgressJobCount={sumBy(operations, "inProgressJobCount")}
      overdueJobCount={sumBy(operations, "overdueJobCount")}
    />
  )
}
