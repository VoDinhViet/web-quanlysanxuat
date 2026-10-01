import { AltArrowLeft } from "@solar-icons/react"

import { LinkButton } from "@/components/ui/button"
import { ProductionJobHeaderActions } from "@/features/production-jobs/components/composites/ProductionJobHeaderActions"
import { ProductionJobHeaderFacts } from "@/features/production-jobs/components/composites/ProductionJobHeaderFacts"
import { ProductionJobStatusBadge } from "@/features/production-jobs/components/primitives/ProductionJobBadges"
import { ProductionJobDetailTabs } from "@/features/production-jobs/components/layouts/ProductionJobDetailTabs"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ProductionJobDetailHeaderProps = {
  productionJob: ProductionJobDetail
}

// Back link, then title + status on the left with the lifecycle actions on the right, the facts
// card below, and the tab strip closing the block (same shape as ProductDetailHeader.tsx).
export function ProductionJobDetailHeader({
  productionJob,
}: ProductionJobDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-col gap-4 px-4 pt-3 pb-4 sm:px-5 print:hidden">
        <LinkButton
          to="/manage/production-jobs"
          search={{ page: 1, limit: 10 }}
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Quay lại danh sách Job"
        >
          <AltArrowLeft className="size-4" />
          Quay lại danh sách
        </LinkButton>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground">
              {productionJob.code}
            </h1>
            <ProductionJobStatusBadge status={productionJob.status} />
          </div>

          <ProductionJobHeaderActions job={productionJob} />
        </div>

        <ProductionJobHeaderFacts job={productionJob} />
      </div>

      <ProductionJobDetailTabs />
    </>
  )
}
