import { useNavigate, useSearch } from "@tanstack/react-router"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { ProductionJobBomTab } from "@/features/production-jobs/components/detail/ProductionJobBomTab"
import { ProductionJobDetailHeader } from "@/features/production-jobs/components/detail/ProductionJobDetailHeader"
import { ProductionJobInfoTab } from "@/features/production-jobs/components/detail/ProductionJobInfoTab"
import { ProductionJobOperationsTab } from "@/features/production-jobs/components/detail/ProductionJobOperationsTab"
import { PRODUCTION_JOB_MOCK_DETAIL } from "@/features/production-jobs/mock/production-job-detail.mock"
import { PRODUCTION_JOB_DETAIL_TABS } from "@/features/production-jobs/schemas/production-job-detail-search.schema"

// UI-only build of the Job detail screen (task 8.2) — every Job routed to here renders the same
// hardcoded PRODUCTION_JOB_MOCK_DETAIL payload rather than reading `productionJobId` against a
// real endpoint; the route has no loader either. Delete the mock import and wire a real
// `useSuspenseQuery` once GET /production-jobs/:jobId ships.
export function ProductionJobDetailPage() {
  const { tab } = useSearch({
    from: "/(authed)/manage_/production-jobs_/$productionJobId",
  })
  const navigate = useNavigate({
    from: "/manage/production-jobs/$productionJobId",
  })

  const detail = PRODUCTION_JOB_MOCK_DETAIL

  // Radix widens onValueChange to `string`; `find` narrows it back without a cast, and an
  // unrecognised value simply doesn't navigate.
  const handleTabChange = (value: string) => {
    const nextTab = PRODUCTION_JOB_DETAIL_TABS.find((item) => item === value)

    if (nextTab) {
      void navigate({ search: { tab: nextTab } })
    }
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết Job"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý sản xuất", href: "/manage/production-jobs" },
          { label: detail.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <Tabs value={tab} onValueChange={handleTabChange} className="gap-0">
            <ProductionJobDetailHeader detail={detail} />

            <TabsContent value="info" className="m-0 outline-none">
              <ProductionJobInfoTab detail={detail} />
            </TabsContent>

            <TabsContent value="bom" className="m-0 outline-none">
              <ProductionJobBomTab materials={detail.materials} />
            </TabsContent>

            <TabsContent value="operations" className="m-0 outline-none">
              <ProductionJobOperationsTab detail={detail} />
            </TabsContent>
          </Tabs>
        </Surface>
      </div>
    </main>
  )
}
