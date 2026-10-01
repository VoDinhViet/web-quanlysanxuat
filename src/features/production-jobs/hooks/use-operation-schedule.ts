import { useMemo, useState } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import {
  buildOperationSchedule,
  countWorkDays,
  recalculateSchedule,
} from "@/features/production-jobs/utils/plan-schedule"
import type { ProductionJobPlanGroupOperation } from "@/lib/types/production-job.type"

export type OperationScheduleRow = ProductionJobPlanGroupOperation & {
  leadtime: number
  dueDate: string // yyyy-MM-dd
}

type UseOperationScheduleArgs = {
  planOperations: ProductionJobPlanGroupOperation[] | undefined
  startDateStr: string
}

// Rows of the leadtime plan. `savedSchedule` is derived from the server data (no effect); user edits
// live in `editedSchedule` on top of it until `discardChanges()`. Operations run in chain — each due date
// starts from the previous one — so the row order is the production order.
export function useOperationSchedule({
  planOperations,
  startDateStr,
}: UseOperationScheduleArgs) {
  const [editedSchedule, setEditedSchedule] = useState<
    OperationScheduleRow[] | null
  >(null)

  const savedSchedule = useMemo(
    () => buildOperationSchedule(planOperations ?? [], startDateStr),
    [planOperations, startDateStr]
  )

  const schedule = editedSchedule ?? savedSchedule

  const setLeadtime = (index: number, newLeadtime: number) => {
    const next = [...schedule]
    next[index] = { ...next[index], leadtime: Math.max(1, newLeadtime) }
    setEditedSchedule(recalculateSchedule(next, startDateStr, index))
  }

  const setDueDate = (index: number, newDueDateStr: string) => {
    if (!newDueDateStr) return
    const prev = index === 0 ? startDateStr : schedule[index - 1].dueDate
    const next = [...schedule]
    next[index] = {
      ...next[index],
      leadtime: countWorkDays(prev, newDueDateStr),
      dueDate: newDueDateStr,
    }
    setEditedSchedule(recalculateSchedule(next, startDateStr, index + 1))
  }

  // Reorder via drag and drop; recalculate sequential due dates from the lowest affected index.
  const reorder = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      fromIndex >= schedule.length ||
      toIndex < 0 ||
      toIndex >= schedule.length
    ) {
      return
    }
    const next = arrayMove(schedule, fromIndex, toIndex)
    setEditedSchedule(
      recalculateSchedule(next, startDateStr, Math.min(fromIndex, toIndex))
    )
  }

  // Thứ tự gợi ý: cấp BOM sâu hơn làm trước (level giảm dần), cùng cấp thì theo sortOrder tăng dần.
  const applySuggestedSequence = () => {
    const suggested = [...schedule].sort(
      (a, b) => b.level - a.level || a.sortOrder - b.sortOrder
    )
    setEditedSchedule(recalculateSchedule(suggested, startDateStr))
  }

  const discardChanges = () => setEditedSchedule(null)

  return {
    schedule,
    setLeadtime,
    setDueDate,
    reorder,
    applySuggestedSequence,
    discardChanges,
  }
}
