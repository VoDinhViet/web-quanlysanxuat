import { RefreshCw } from "lucide-react"
import { useNavigate, useSearch } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { ManageAlerts } from "@/features/manage/components/ManageAlerts"
import { ManageAnalyticsRow } from "@/features/manage/components/ManageAnalyticsRow"
import { ManageFooter } from "@/features/manage/components/ManageFooter"
import { ManageOperationsRow } from "@/features/manage/components/ManageOperationsRow"
import { ManageProductionRow } from "@/features/manage/components/ManageProductionRow"
import { ManageStatCards } from "@/features/manage/components/ManageStatCards"

export function ManagePage() {
  const search = useSearch({ from: "/(authed)/manage" })
  const navigate = useNavigate({ from: "/manage" })

  const handleDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        startDate: range.from,
        endDate: range.to,
      }),
    })
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Dashboard"
        breadcrumbs={[{ label: "Tổng quan điều hành" }]}
        notificationCount={5}
      />

      <div className="w-full space-y-5 p-4 sm:p-5 lg:p-6">
        {/* Chỉ 6 thẻ KPI (ManageStatCards) đọc theo khoảng ngày này — các widget khác bên dưới
            vẫn còn mock, chưa có API. */}
        <div className="flex justify-end gap-2">
          <DateRangePicker
            id="manage-date-range"
            from={search.startDate}
            to={search.endDate}
            onChange={handleDateRangeChange}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Làm mới"
            onClick={() =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  startDate: undefined,
                  endDate: undefined,
                }),
              })
            }
          >
            <RefreshCw />
          </Button>
        </div>

        <ManageStatCards />
        <ManageAlerts />
        <ManageProductionRow />
        <ManageOperationsRow />
        <ManageAnalyticsRow />
        <ManageFooter />
      </div>
    </main>
  )
}
