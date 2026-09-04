import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Key } from "react-aria-components"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { ProductionJobBomTab } from "@/features/production-jobs/components/sections/ProductionJobBomTab"
import { ProductionJobDetailHeader } from "@/features/production-jobs/components/layouts/ProductionJobDetailHeader"
import { ProductionJobInfoTab } from "@/features/production-jobs/components/sections/ProductionJobInfoTab"
import { ProductionJobOperationsTab } from "@/features/production-jobs/components/sections/ProductionJobOperationsTab"
import { productionJobQueryOptions } from "@/features/production-jobs/api/options"
import { productionJobDetailTabs } from "@/features/production-jobs/schemas/production-job-detail-search.schema"

export function ProductionJobDetailPage() {
  const { productionJobId } = useParams({
    from: "/(authed)/manage_/production-jobs_/$productionJobId",
  })
  const { tab } = useSearch({
    from: "/(authed)/manage_/production-jobs_/$productionJobId",
  })
  const navigate = useNavigate({
    from: "/manage/production-jobs/$productionJobId",
  })

  const { data: productionJob } = useSuspenseQuery(
    productionJobQueryOptions(productionJobId)
  )

  // RAC's onSelectionChange returns a `Key` (string | number); `find` narrows it back to
  // the search param's literal union without a cast, and an unrecognised value simply
  // doesn't navigate.
  const handleTabChange = (key: Key) => {
    const nextTab = productionJobDetailTabs.find((item) => item === String(key))

    if (nextTab) {
      void navigate({ search: { tab: nextTab } })
    }
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết Job"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý sản xuất", href: "/manage/production-jobs" },
          { label: productionJob.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <Tabs
            selectedKey={tab}
            onSelectionChange={handleTabChange}
            className="gap-0"
          >
            <ProductionJobDetailHeader productionJob={productionJob} />

            <TabsContent id="info" className="m-0 outline-none">
              <ProductionJobInfoTab productionJob={productionJob} />
            </TabsContent>

            <TabsContent id="bom" className="m-0 outline-none">
              <ProductionJobBomTab productionJobId={productionJobId} />
            </TabsContent>

            <TabsContent id="operations" className="m-0 outline-none">
              <ProductionJobOperationsTab
                productionJobId={productionJobId}
                status={productionJob.status}
              />
            </TabsContent>
          </Tabs>
        </Surface>
      </div>
    </main>
  )
}
