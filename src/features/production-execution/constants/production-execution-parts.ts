import type {
  ProductionJobBomItem,
  ProductionJobOperation,
} from "@/lib/types/production-job.type"

export type PartRow = {
  bomItem: ProductionJobBomItem
  operation: ProductionJobOperation
}

// Một dòng / (Part × công đoạn đang chọn) — BE đã lọc sẵn theo `operationId`, ở đây chỉ trải `operations[]` ra thành dòng.
export function buildPartRows(groups: ProductionJobBomItem[]): PartRow[] {
  return groups.flatMap((bomItem) =>
    bomItem.operations.map((operation) => ({ bomItem, operation }))
  )
}

// Hạn hoàn thành của Job cho công đoạn đang chọn = hạn muộn nhất qua mọi Part — cùng luật
// `operationDueDate` của danh sách (BE `getJobs`). ISO `yyyy-MM-dd` so sánh được như chuỗi.
export function resolveLatestDueDate(rows: PartRow[]): string | null {
  return rows.reduce<string | null>((latest, { operation }) => {
    if (operation.dueDate === null) return latest
    return latest === null || operation.dueDate > latest
      ? operation.dueDate
      : latest
  }, null)
}

export function isAllPartsCompleted(rows: PartRow[]): boolean {
  return (
    rows.length > 0 &&
    rows.every(({ operation }) => operation.completedDate !== null)
  )
}
