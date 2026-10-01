import { orderBy } from "lodash-es"
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
  let prevDate = startIndex === 0 ? startDateStr : items[startIndex - 1].dueDate

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

export type OperationSequenceItem = {
  level: number
  sortOrder: number
}

/**
 * Thứ tự gợi ý: chi tiết cấp BOM sâu nhất làm trước, thành phẩm (cấp 0: lắp ráp, đóng gói) làm
 * sau cùng; cùng cấp thì theo thứ tự trong routing.
 */
export function suggestOperationSequence<T extends OperationSequenceItem>(
  items: T[]
): T[] {
  return orderBy(items, ["level", "sortOrder"], ["desc", "asc"])
}

/**
 * Vị trí các dòng đang đứng trước một dòng thuộc cấp BOM sâu hơn — công đoạn thành phẩm không thể
 * xong trước công đoạn của chi tiết cấu thành nó.
 */
export function findSequenceConflicts<
  T extends Pick<OperationSequenceItem, "level">,
>(items: T[]): Set<number> {
  const conflicts = new Set<number>()
  let deepestAfter = -Infinity
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].level < deepestAfter) conflicts.add(i)
    deepestAfter = Math.max(deepestAfter, items[i].level)
  }
  return conflicts
}

/**
 * Dựng leadtime/hạn nối tiếp từ hạn đã lưu (`dueDate` ISO hoặc null): có hạn thì leadtime là số
 * ngày làm việc từ hạn trước, chưa có thì mặc định 1 ngày.
 */
export function buildOperationSchedule<T extends { dueDate: string | null }>(
  items: T[],
  startDateStr: string
): (Omit<T, "dueDate"> & PlanScheduleItem)[] {
  const schedule: (Omit<T, "dueDate"> & PlanScheduleItem)[] = []
  let prevDate = startDateStr

  for (const { dueDate: savedDueDate, ...rest } of items) {
    const dueDate = savedDueDate
      ? DateTime.fromISO(savedDueDate).toFormat("yyyy-MM-dd")
      : addWorkDays(prevDate, 1)
    const leadtime = savedDueDate ? countWorkDays(prevDate, dueDate) : 1

    schedule.push({ ...rest, leadtime, dueDate })
    prevDate = dueDate
  }

  return schedule
}
