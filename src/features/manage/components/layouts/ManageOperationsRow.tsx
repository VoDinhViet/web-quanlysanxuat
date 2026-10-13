import { ManageOutsourcingDueDateTable } from "@/features/manage/components/composites/ManageOutsourcingDueDateTable"
import { ManageUpcomingDeliveriesTable } from "@/features/manage/components/composites/ManageUpcomingDeliveriesTable"

/** "Gia công ngoài trễ hạn" + "DO sắp giao". */
export function ManageOperationsRow() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <ManageOutsourcingDueDateTable />
      <ManageUpcomingDeliveriesTable />
    </div>
  )
}
