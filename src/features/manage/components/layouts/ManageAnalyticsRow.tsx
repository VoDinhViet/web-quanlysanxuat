import { ManageCardLink } from "@/features/manage/components/primitives/ManageCardLink"
import { ManageCardTitle } from "@/features/manage/components/primitives/ManageCardTitle"
import { ManageQcRateChart } from "@/features/manage/components/composites/ManageQcRateChart"
import { ManageQuickActions } from "@/features/manage/components/composites/ManageQuickActions"

/** QC line chart + quick actions. */
export function ManageAnalyticsRow() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ManageCardTitle>Tỷ lệ đạt QC</ManageCardTitle>
        </div>
        <ManageQcRateChart />
        <ManageCardLink to="/manage/oqc" />
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ManageCardTitle>Thao tác nhanh</ManageCardTitle>
        </div>
        <ManageQuickActions />
      </div>
    </div>
  )
}
