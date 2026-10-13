import {
  CheckRead,
  Flag,
  Hourglass,
  NotesMinimalistic,
  Settings,
  ShieldCheck,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import { NcrStatus } from "@/lib/types/ncr.type"
import { cn } from "@/lib/utils"

type NcrProgressCardProps = {
  status: NcrStatus
}

type ProgressStep = {
  label: string
  hint: string
  icon: ComponentType<IconProps>
}

const progressSteps: ProgressStep[] = [
  {
    label: "Phân tích",
    hint: "Nguyên nhân & biện pháp",
    icon: NotesMinimalistic,
  },
  { label: "Chờ duyệt", hint: "Giám đốc xem xét", icon: Hourglass },
  { label: "Đã duyệt", hint: "Chọn hướng xử lý", icon: ShieldCheck },
  { label: "Xử lý", hint: "LSX phụ / OQC lại", icon: Settings },
  { label: "Đóng NCR", hint: "Hoàn tất", icon: Flag },
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

// Vertical stepper for the right-hand column: each step is an icon on a connector line with its
// label and hint beside it.
export function NcrProgressCard({ status }: NcrProgressCardProps) {
  const currentStep = currentStepByStatus[status]
  const isRejected = status === NcrStatus.REJECTED
  const isClosed = status === NcrStatus.CLOSED

  return (
    <NcrSectionCard title="Tiến trình xử lý">
      <ol>
        {progressSteps.map((step, index) => {
          const isDone = index < currentStep || isClosed
          const isCurrent = index === currentStep && !isClosed
          const isLast = index === progressSteps.length - 1
          const StepIcon = isDone ? CheckRead : step.icon

          return (
            <li
              key={step.label}
              aria-current={isCurrent ? "step" : undefined}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
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
                  <StepIcon
                    weight={isDone || isCurrent ? "Bold" : "Linear"}
                    className="size-4"
                  />
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      "my-1 w-0.5 flex-1",
                      isDone ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
              <div className={cn("min-w-0 pt-1", !isLast && "pb-4")}>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && isRejected && "text-destructive",
                    isCurrent && !isRejected && "text-primary",
                    !isDone && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {isCurrent && isRejected
                    ? "Không duyệt — sửa lại"
                    : step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.hint}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </NcrSectionCard>
  )
}
