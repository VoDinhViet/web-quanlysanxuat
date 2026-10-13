import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { StatusNotice } from "@/components/shared/composites/StatusNotice"
import { ncrQueryOptions } from "@/features/ncrs/api/options"
import { NcrInfoCard } from "@/features/ncrs/components/composites/NcrInfoCard"
import { NcrLogsCard } from "@/features/ncrs/components/composites/NcrLogsCard"
import { NcrProgressCard } from "@/features/ncrs/components/composites/NcrProgressCard"
import { NcrProductionOrdersCard } from "@/features/ncrs/components/composites/NcrProductionOrdersCard"
import { NcrSummaryCards } from "@/features/ncrs/components/composites/NcrSummaryCards"
import { NcrDetailHeader } from "@/features/ncrs/components/layouts/NcrDetailHeader"
import { NcrAnalysisForm } from "@/features/ncrs/components/sections/NcrAnalysisForm"
import { NcrCostLinesCard } from "@/features/ncrs/components/sections/NcrCostLinesCard"
import { NcrStatus } from "@/lib/types/ncr.type"

export function NcrDetailPage() {
  const { ncrId } = useParams({ from: "/(authed)/manage_/ncrs_/$ncrId" })

  const { data: ncr } = useSuspenseQuery(ncrQueryOptions(ncrId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết NCR"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Kiểm tra chất lượng (QC)" },
          { label: "NCR", href: "/manage/ncrs" },
          { label: ncr.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-xs">
          <NcrDetailHeader ncr={ncr} />
          <NcrSummaryCards ncr={ncr} />
        </section>

        {ncr.status === NcrStatus.REJECTED && ncr.rejectionReason && (
          <StatusNotice
            title="NCR không được duyệt"
            reason={ncr.rejectionReason}
          />
        )}

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-4">
            <NcrInfoCard ncr={ncr} />
            <NcrAnalysisForm key={ncr.id + ncr.status} ncr={ncr} />
            <NcrCostLinesCard key={ncr.id + ncr.costLines.length} ncr={ncr} />
          </div>

          <div className="flex flex-col gap-4">
            <NcrProgressCard status={ncr.status} />
            {ncr.productionOrders.length > 0 && (
              <NcrProductionOrdersCard
                productionOrders={ncr.productionOrders}
              />
            )}
            <NcrLogsCard logs={ncr.logs} />
          </div>
        </div>
      </div>
    </main>
  )
}
