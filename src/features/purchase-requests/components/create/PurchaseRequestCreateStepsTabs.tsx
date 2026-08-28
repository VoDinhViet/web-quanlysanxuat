import { ClipboardList, Package } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type PurchaseRequestCreateWizardStep = "materials" | "quantities"

type PurchaseRequestCreateStepItem =
  WizardStepNavItem<PurchaseRequestCreateWizardStep> & {
    label: string
    icon: ComponentType<LucideProps>
  }

export const purchaseRequestCreateStepItems: PurchaseRequestCreateStepItem[] = [
  {
    value: "materials",
    label: "1. Chọn vật tư",
    icon: Package,
    nextLabel: "Tiếp tục: nhập số lượng",
  },
  {
    value: "quantities",
    label: "2. Số lượng & thông tin",
    icon: ClipboardList,
    prevLabel: "Quay lại chọn vật tư",
  },
]

type PurchaseRequestCreateStepsTabsProps = {
  // Same gate as the "Tiếp tục" button below the picker — no jumping to step 2 before at
  // least 1 vật tư is picked. Step 1's tab is always reachable to go back.
  canGoToQuantities: boolean
}

// Chỉ vẽ dải trigger — Tabs root (value/onValueChange) + TabsContent panel sống ở
// PurchaseRequestCreateForm.tsx, cùng cách tách ProductDetailTabs.tsx ("Only the triggers — the
// panels live in the page"). Mirrors CreateQuotationStepsTabs.tsx (the repo's other 2-step
// create wizard) — same TabsList/TabsTrigger override chain, adapted to this wizard's own step
// values.
export function PurchaseRequestCreateStepsTabs({
  canGoToQuantities,
}: PurchaseRequestCreateStepsTabsProps) {
  return (
    <div className="border-b border-border">
      {/* `group-data-horizontal/tabs:h-auto`, not plain `h-auto`: the list's cva base pins the
          height with that same variant chain, and tailwind-merge only dedupes when the chains
          match — otherwise the list stays 36px while the 48px triggers overflow it. */}
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {purchaseRequestCreateStepItems.map((item) => {
          const isDisabled = item.value === "quantities" && !canGoToQuantities

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={isDisabled}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
                // Same override chain CreateQuotationStepsTabs.tsx documents: both the plain
                // `data-active:bg-*` and the line-variant-scoped one have to be repeated
                // verbatim or tailwind-merge can't tell they're meant to replace the primitive's.
                "data-active:bg-primary/5 data-active:text-primary",
                "group-data-[variant=line]/tabs-list:data-active:bg-primary/5",
                "data-active:hover:bg-primary/5",
                "after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5",
                isDisabled && "cursor-not-allowed opacity-60"
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </div>
  )
}
