import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ManageCardLink } from "@/features/manage/components/ManageCardLink"
import { ManageCardTitle } from "@/features/manage/components/ManageCardTitle"
import { ManageInventoryChart } from "@/features/manage/components/ManageInventoryChart"
import { ManageNcrByTypeChart } from "@/features/manage/components/ManageNcrByTypeChart"
import { ManageQcRateChart } from "@/features/manage/components/ManageQcRateChart"
import { ManageQuickActions } from "@/features/manage/components/ManageQuickActions"

/** Mockup row: inventory bar chart, QC line chart, NCR-by-type donut, quick actions. */
export function ManageAnalyticsRow() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
      <Card size="sm">
        <CardHeader>
          <ManageCardTitle>Tồn kho cảnh báo</ManageCardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ManageInventoryChart />
          <ManageCardLink />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <ManageCardTitle>Tỷ lệ đạt QC</ManageCardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ManageQcRateChart />
          <ManageCardLink />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <ManageCardTitle>NCR theo loại lỗi (tháng)</ManageCardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ManageNcrByTypeChart />
          <ManageCardLink />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <ManageCardTitle>Thao tác nhanh</ManageCardTitle>
        </CardHeader>
        <CardContent>
          <ManageQuickActions />
        </CardContent>
      </Card>
    </div>
  )
}
