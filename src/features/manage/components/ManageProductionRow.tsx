import { ManageJobDueDateTable } from "@/features/manage/components/ManageJobDueDateTable"
import { ManageProductionChart } from "@/features/manage/components/ManageProductionChart"

/** "Tiến độ sản xuất" + "Job trễ hạn". */
export function ManageProductionRow() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <ManageProductionChart />
      <ManageJobDueDateTable />
    </div>
  )
}
