import { Icon } from "@iconify/react"
import infoCircleBold from "@iconify-icons/solar/info-circle-bold"
import layersBold from "@iconify-icons/solar/layers-bold"
import routeBold from "@iconify-icons/solar/route-bold"
import type { IconifyIcon } from "@iconify/types"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductionJobDetailTab } from "@/features/production-jobs/schemas/production-job-detail-search.schema"

type ProductionJobDetailTabItem = {
  value: ProductionJobDetailTab
  label: string
  icon: IconifyIcon
}

const PRODUCTION_JOB_DETAIL_TAB_ITEMS: ProductionJobDetailTabItem[] = [
  { value: "info", label: "Thông tin chung", icon: infoCircleBold },
  { value: "bom", label: "BOM vật tư", icon: layersBold },
  { value: "operations", label: "Công đoạn sản xuất", icon: routeBold },
]

// Only the triggers — the panels live in the page, same split as ProductDetailTabs.tsx. No
// locked tabs here: every tab has at least placeholder content already (see the page). Only 3
// tabs — "Tài liệu"/"Ghi chú"/"Lịch sử" from the original 6-tab mockup now live as sub-sections
// inside the "info" panel instead (ProductionJobInfoTab.tsx), so the strip doesn't overflow.
export function ProductionJobDetailTabs() {
  return (
    <div className="border-b border-border print:hidden">
      {/* See ProductDetailTabs.tsx for why every override below repeats the primitive's own
          variant chain verbatim — tailwind-merge only dedupes when the chains match. */}
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {PRODUCTION_JOB_DETAIL_TAB_ITEMS.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5 hover:bg-muted/40 hover:text-foreground data-active:bg-primary/5 data-active:text-primary group-data-[variant=line]/tabs-list:data-active:bg-primary/5 data-active:hover:bg-primary/5"
          >
            <Icon icon={item.icon} className="size-3.5" />
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
