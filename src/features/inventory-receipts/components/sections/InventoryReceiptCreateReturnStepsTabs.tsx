import { CheckCircle, Checklist, Documents } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type InventoryReceiptReturnWizardStep = "info" | "items" | "confirm"

type StepItem = WizardStepNavItem<InventoryReceiptReturnWizardStep> & {
  label: string
  icon: ComponentType<IconProps>
}

export const stepItems: StepItem[] = [
  {
    value: "info",
    label: "1. Thông tin chung",
    icon: Documents,
    nextLabel: "Tiếp theo: Vật tư",
  },
  {
    value: "items",
    label: "2. Vật tư",
    icon: Checklist,
    prevLabel: "Quay lại thông tin chung",
    nextLabel: "Tiếp theo: Xác nhận",
  },
  {
    value: "confirm",
    label: "3. Lưu nháp / Xác nhận",
    icon: CheckCircle,
    prevLabel: "Quay lại vật tư",
  },
]

type InventoryReceiptCreateReturnStepsTabsProps = {
  canGoToItems: boolean
  canGoToConfirm: boolean
}

// Chỉ vẽ dải trigger — Tabs root (selectedKey/onSelectionChange) + TabsContent panel sống ở
// InventoryReceiptCreateReturnForm.tsx. Bước ① luôn mở được để quay lại đổi khách hàng.
export function InventoryReceiptCreateReturnStepsTabs({
  canGoToItems,
  canGoToConfirm,
}: InventoryReceiptCreateReturnStepsTabsProps) {
  const disabledByStep: Record<InventoryReceiptReturnWizardStep, boolean> = {
    info: false,
    items: !canGoToItems,
    confirm: !canGoToConfirm,
  }

  return (
    <div className="border-b border-border">
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {stepItems.map((item) => {
          const isDisabled = disabledByStep[item.value]

          return (
            <TabsTrigger
              key={item.value}
              id={item.value}
              isDisabled={isDisabled}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
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
