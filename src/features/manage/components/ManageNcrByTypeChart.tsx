import { ManageDonutChart } from "@/features/manage/components/ManageProductionChart"
import {
  ncrByType,
  ncrByTypeTotal,
} from "@/features/manage/mock/manage-dashboard.mock"

export function ManageNcrByTypeChart() {
  return (
    <ManageDonutChart
      slices={ncrByType}
      total={ncrByTypeTotal}
      totalLabel="ncr"
    />
  )
}
