import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
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
        title="Dashboard"
        breadcrumbs={[{ label: "Tổng quan điều hành" }]}
        notificationCount={5}
      />

      <div className="w-full space-y-5 p-4 sm:p-5 lg:p-6">
        {/* Decorative — no state/filtering wired up (mock data, no API). */}
        <div className="flex justify-end gap-2">
          <Input
            type="date"
            readOnly
            defaultValue="2024-05-20"
            className="w-auto"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Làm mới"
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
