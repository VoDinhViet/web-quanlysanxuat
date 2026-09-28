import { DateTime } from "luxon"

/**
 * Thêm số ngày làm việc vào chuỗi ngày yyyy-MM-dd (bỏ qua Chủ nhật).
 */
export function addWorkDays(startDateStr: string, days: number): string {
  let dt = DateTime.fromISO(startDateStr).startOf("day")
  let added = 0
  const target = Math.max(1, days)
  while (added < target) {
    dt = dt.plus({ days: 1 })
    if (dt.weekday !== 7) added++
  }
  return dt.toFormat("yyyy-MM-dd")
}

/**
 * Đếm số ngày làm việc giữa 2 chuỗi ngày yyyy-MM-dd (bỏ qua Chủ nhật).
 */
export function countWorkDays(
  startDateStr: string,
  endDateStr: string
): number {
  const start = DateTime.fromISO(startDateStr).startOf("day")
  const end = DateTime.fromISO(endDateStr).startOf("day")
  if (end <= start) return 1

  let current = start
  let count = 0
  while (current < end) {
    current = current.plus({ days: 1 })
    if (current.weekday !== 7) count++
  }
  return Math.max(1, count)
}

export type PlanScheduleItem = {
  leadtime: number
  dueDate: string
}

/**
 * Tính lại hạn hoàn thành nối tiếp theo Leadtime từ một vị trí bắt đầu.
 */
export function recalculateSchedule<T extends PlanScheduleItem>(
  items: T[],
  startDateStr: string,
  startIndex = 0
): T[] {
  let prevDate =
    startIndex === 0 ? startDateStr : items[startIndex - 1].dueDate

  const result = [...items]
  for (let i = startIndex; i < result.length; i++) {
    const computedDueDate = addWorkDays(prevDate, result[i].leadtime)
    result[i] = {
      ...result[i],
      dueDate: computedDueDate,
    }
    prevDate = computedDueDate
  }

  return result
}
