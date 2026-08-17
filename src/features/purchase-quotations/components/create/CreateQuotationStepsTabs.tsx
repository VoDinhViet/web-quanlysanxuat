import { Box, TagPrice } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type CreateQuotationWizardStep = "items" | "suppliers"

type CreateQuotationStepItem = {
  value: CreateQuotationWizardStep
  label: string
  icon: ComponentType<IconProps>
}

const createQuotationStepItems: CreateQuotationStepItem[] = [
  { value: "items", label: "1. Chọn vật tư", icon: Box },
  { value: "suppliers", label: "2. Khai báo NCC & báo giá", icon: TagPrice },
]

type CreateQuotationStepsTabsProps = {
  step: CreateQuotationWizardStep
  // Same gate as the "Tiếp theo" button below the picker — no jumping to step 2 before at
  // least 1 vật tư is picked. Step 1's tab is always reachable to go back.
  canGoToSuppliers: boolean
  onStepChange: (step: CreateQuotationWizardStep) => void
}

// Mirrors ProductDetailTabs.tsx's "line" tab bar (the only other step/tab indicator in the
// repo) — same TabsList/TabsTrigger override chain, adapted to a 2-step wizard's own gating
// (a disabled trigger swallowing the click, not a per-tab lock tooltip).
export function CreateQuotationStepsTabs({
  step,
  canGoToSuppliers,
  onStepChange,
}: CreateQuotationStepsTabsProps) {
  return (
    <Tabs
      value={step}
      onValueChange={(value) =>
        onStepChange(value as CreateQuotationWizardStep)
      }
      className="border-b border-border"
    >
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
              value={item.value}
              disabled={isDisabled}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
                // Same override chain ProductDetailTabs.tsx documents: both the plain
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
    </Tabs>
  )
}
