import { Box, TagPrice } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type CreateQuotationWizardStep = "items" | "suppliers"

type CreateQuotationStepItem = WizardStepNavItem<CreateQuotationWizardStep> & {
  label: string
  icon: ComponentType<IconProps>
}

export const createQuotationStepItems: CreateQuotationStepItem[] = [
  {
    value: "items",
    label: "1. Chọn vật tư",
    icon: Box,
    nextLabel: "Tiếp theo: Khai báo NCC & báo giá",
  },
  {
    value: "suppliers",
    label: "2. Khai báo NCC & báo giá",
    icon: TagPrice,
    prevLabel: "Quay lại chọn vật tư",
  },
]

type CreateQuotationStepsTabsProps = {
  // Same gate as the "Tiếp theo" button below the picker — no jumping to step 2 before at
  // least 1 vật tư is picked. Step 1's tab is always reachable to go back.
  canGoToSuppliers: boolean
}

// Chỉ vẽ dải trigger — Tabs root (selectedKey/onSelectionChange) + TabsContent panel sống ở
// CreateQuotationForm.tsx, cùng cách tách ProductDetailTabs.tsx ("Only the triggers — the panels
// live in the page"). Mirrors ProductDetailTabs.tsx's "line" tab bar (the only other step/tab
// indicator in the repo) — same TabsList/TabsTrigger override chain, adapted to a 2-step
// wizard's own gating (a disabled trigger swallowing the click, not a per-tab lock tooltip).
export function CreateQuotationStepsTabs({
  canGoToSuppliers,
}: CreateQuotationStepsTabsProps) {
  return (
    <div className="border-b border-border">
      {/* `group-data-horizontal/tabs:h-auto`, not plain `h-auto`: the list's cva base pins the
          height with that same variant chain, and tailwind-merge only dedupes when the chains
          match — otherwise the list stays 36px while the 48px triggers overflow it. */}
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {createQuotationStepItems.map((item) => {
          const isDisabled = item.value === "suppliers" && !canGoToSuppliers

          return (
            <TabsTrigger
              key={item.value}
              id={item.value}
              isDisabled={isDisabled}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
                // Same override chain ProductDetailTabs.tsx documents: both the plain
                // `data-selected:bg-*` and the line-variant-scoped one have to be repeated
                // verbatim or tailwind-merge can't tell they're meant to replace the primitive's.
                "data-selected:bg-primary/5 data-selected:text-primary",
                "group-data-[variant=line]/tabs-list:data-selected:bg-primary/5",
                "data-selected:hover:bg-primary/5",
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
