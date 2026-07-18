import { ManageDonutChart } from "@/features/manage/components/ManageProductionChart"
import {
  NCR_BY_TYPE,
  NCR_BY_TYPE_TOTAL,
} from "@/features/manage/mock/manage-dashboard.mock"

export function ManageNcrByTypeChart() {
  return (
    <ManageDonutChart
      slices={NCR_BY_TYPE}
      total={NCR_BY_TYPE_TOTAL}
      totalLabel="ncr"
    />
  )
}
