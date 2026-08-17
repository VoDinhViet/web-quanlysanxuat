import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { ProductionJobBomTab } from "@/features/production-jobs/components/detail/ProductionJobBomTab"
import { ProductionJobDetailHeader } from "@/features/production-jobs/components/detail/ProductionJobDetailHeader"
import { ProductionJobInfoTab } from "@/features/production-jobs/components/detail/ProductionJobInfoTab"
import { ProductionJobMaterialsTab } from "@/features/production-jobs/components/detail/ProductionJobMaterialsTab"
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

  const { data: detail } = useSuspenseQuery(
    productionJobQueryOptions(productionJobId)
  )

  // Radix widens onValueChange to `string`; `find` narrows it back without a cast, and an
  // unrecognised value simply doesn't navigate.
  const handleTabChange = (value: string) => {
    const nextTab = productionJobDetailTabs.find((item) => item === value)

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

            <TabsContent value="materials" className="m-0 outline-none">
              <ProductionJobMaterialsTab productionJobId={productionJobId} />
            </TabsContent>

            <TabsContent value="bom" className="m-0 outline-none">
              <ProductionJobBomTab
                productionJobId={productionJobId}
                status={detail.status}
              />
            </TabsContent>
          </Tabs>
        </Surface>
      </div>
    </main>
  )
}
