import { ManageOpenNcrTable } from "@/features/manage/components/ManageOpenNcrTable"
import { ManageOutsourcingDueDateTable } from "@/features/manage/components/ManageOutsourcingDueDateTable"
import { ManageUpcomingDeliveriesTable } from "@/features/manage/components/ManageUpcomingDeliveriesTable"

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
