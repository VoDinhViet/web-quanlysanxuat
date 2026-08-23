import { ClipboardList, Factory, ListChecks } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type CreateInventoryRequisitionWizardStep = "source" | "items" | "info"

type CreateInventoryRequisitionStepItem = {
  value: CreateInventoryRequisitionWizardStep
  label: string
  icon: ComponentType<LucideProps>
}

// 3 bước cố định cho cả 2 nguồn lãnh (LSX/thủ công) — nguồn chọn bằng radio ngay trong bước ①
// (CreateInventoryRequisitionSourceSection.tsx), không còn tách route/số bước theo luồng. Export
// để CreateInventoryRequisitionForm.tsx's handleStepChange tra cứu lại giá trị step từ Radix.
export const createInventoryRequisitionStepItems: CreateInventoryRequisitionStepItem[] =
  [
    { value: "source", label: "① Nguồn lãnh", icon: Factory },
    { value: "items", label: "② Chọn vật tư", icon: ListChecks },
    { value: "info", label: "③ SL & thông tin", icon: ClipboardList },
  ]

type CreateInventoryRequisitionStepsTabsProps = {
  canGoToItems: boolean
  canGoToInfo: boolean
}

// Chỉ vẽ dải trigger — Tabs root (value/onValueChange) + TabsContent panel sống ở
// CreateInventoryRequisitionForm.tsx, cùng cách PurchaseRequestCreateStepsTabs.tsx tách.
export function CreateInventoryRequisitionStepsTabs({
  canGoToItems,
  canGoToInfo,
}: CreateInventoryRequisitionStepsTabsProps) {
  return (
    <div className="border-b border-border">
      {/* `group-data-horizontal/tabs:h-auto`, not plain `h-auto`: the list's cva base pins the
          height with that same variant chain, and tailwind-merge only dedupes when the chains
          match — otherwise the list stays 36px while the 48px triggers overflow it. */}
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {createInventoryRequisitionStepItems.map((item) => {
          const isDisabled =
            (item.value === "items" && !canGoToItems) ||
            (item.value === "info" && !canGoToInfo)

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={isDisabled}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
                // Same override chain PurchaseRequestCreateStepsTabs.tsx documents: both the
                // plain `data-active:bg-*` and the line-variant-scoped one have to be repeated
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
