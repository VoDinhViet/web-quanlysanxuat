import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { ManageAlerts } from "@/features/manage/components/ManageAlerts"
import { ManageAnalyticsRow } from "@/features/manage/components/ManageAnalyticsRow"
import { ManageFooter } from "@/features/manage/components/ManageFooter"
import { ManageOperationsRow } from "@/features/manage/components/ManageOperationsRow"
import { ManageProductionRow } from "@/features/manage/components/ManageProductionRow"
import { ManageStatCards } from "@/features/manage/components/ManageStatCards"

export function ManagePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Bảng điều khiển"
        breadcrumbs={[{ label: "Tổng quan điều hành" }]}
      />

      <div className="w-full space-y-5 p-4 sm:p-5 lg:p-6">
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
