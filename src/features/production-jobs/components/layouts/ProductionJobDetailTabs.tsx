import { InfoCircle, Layers, Route } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductionJobDetailTab } from "@/features/production-jobs/schemas/production-job-detail-search.schema"

type ProductionJobDetailTabItem = {
  value: ProductionJobDetailTab
  label: string
  icon: ComponentType<IconProps>
}

const productionJobDetailTabItems: ProductionJobDetailTabItem[] = [
  { value: "info", label: "Thông tin chung", icon: InfoCircle },
  { value: "bom", label: "BOM", icon: Layers },
  { value: "operations", label: "Công đoạn sản xuất", icon: Route },
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
        {productionJobDetailTabItems.map((item) => (
          <TabsTrigger
            key={item.value}
            id={item.value}
            className="h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5 hover:bg-muted/40 hover:text-foreground data-selected:bg-primary/5 data-selected:text-primary group-data-[variant=line]/tabs-list:data-selected:bg-primary/5 data-selected:hover:bg-primary/5"
          >
            <item.icon className="size-3.5" />
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
