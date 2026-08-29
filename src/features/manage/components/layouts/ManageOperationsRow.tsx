import { ManageOpenNcrTable } from "@/features/manage/components/composites/ManageOpenNcrTable"
import { ManageOutsourcingDueDateTable } from "@/features/manage/components/composites/ManageOutsourcingDueDateTable"
import { ManageUpcomingDeliveriesTable } from "@/features/manage/components/composites/ManageUpcomingDeliveriesTable"

/** "Gia công ngoài trễ hạn" + "NCR chưa xử lý" + "DO sắp giao". */
export function ManageOperationsRow() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <ManageOutsourcingDueDateTable />
      <ManageOpenNcrTable />
      <ManageUpcomingDeliveriesTable />
    </div>
  )
}
