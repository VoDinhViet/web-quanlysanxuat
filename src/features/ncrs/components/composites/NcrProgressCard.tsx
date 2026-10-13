import { Check } from "lucide-react"

import { NcrStatus } from "@/lib/types/ncr.type"
import { cn } from "@/lib/utils"

type NcrProgressCardProps = {
  status: NcrStatus
}

type ProgressStep = {
  label: string
  hint: string
}

const progressSteps: ProgressStep[] = [
  { label: "Phân tích", hint: "Nguyên nhân & biện pháp" },
  { label: "Chờ duyệt", hint: "Giám đốc xem xét" },
  { label: "Đã duyệt", hint: "Chọn hướng xử lý" },
  { label: "Xử lý", hint: "LSX phụ / OQC lại" },
  { label: "Đóng NCR", hint: "Hoàn tất" },
]

const currentStepByStatus: Record<NcrStatus, number> = {
  [NcrStatus.OPEN]: 0,
  [NcrStatus.REJECTED]: 0,
  [NcrStatus.PENDING_APPROVAL]: 1,
  [NcrStatus.APPROVED]: 2,
  [NcrStatus.IN_PROGRESS]: 3,
  [NcrStatus.PENDING_QC]: 3,
  [NcrStatus.CLOSED]: 4,
}

export function NcrProgressCard({ status }: NcrProgressCardProps) {
  const currentStep = currentStepByStatus[status]
  const isRejected = status === NcrStatus.REJECTED
  const isClosed = status === NcrStatus.CLOSED

  return (
    <ol className="grid grid-cols-5 gap-2 rounded-lg bg-card p-4 shadow-card sm:p-5">
      {progressSteps.map((step, index) => {
        const isDone = index < currentStep || isClosed
        const isCurrent = index === currentStep && !isClosed

        return (
          <li key={step.label} className="flex flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-0.5 flex-1",
                  index === 0 && "invisible",
                  isDone || isCurrent ? "bg-primary" : "bg-border"
                )}
              />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isDone && "bg-primary text-primary-foreground",
                  isCurrent &&
                    !isRejected &&
                    "bg-primary/10 text-primary ring-2 ring-primary",
                  isCurrent &&
                    isRejected &&
                    "bg-destructive/10 text-destructive ring-2 ring-destructive",
                  !isDone && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1",
                  index === progressSteps.length - 1 && "invisible",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            </div>
            <div className="text-center">
              <p
                className={cn(
                  "text-xs font-semibold",
                  isCurrent && isRejected && "text-destructive",
                  isCurrent && !isRejected && "text-primary",
                  !isDone && !isCurrent && "text-muted-foreground"
                )}
              >
                {isCurrent && isRejected ? "Không duyệt — sửa lại" : step.label}
              </p>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                {step.hint}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
