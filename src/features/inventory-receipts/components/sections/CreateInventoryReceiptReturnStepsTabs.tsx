import { CheckCircle, Checklist, Documents } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type InventoryReceiptReturnWizardStep = "info" | "picker" | "items"

type StepItem = WizardStepNavItem<InventoryReceiptReturnWizardStep> & {
  label: string
  icon: ComponentType<IconProps>
}

export const stepItems: StepItem[] = [
  {
    value: "info",
    label: "1. Thông tin chung",
    icon: Documents,
    nextLabel: "Tiếp theo: Chọn vật tư",
  },
  {
    value: "picker",
    label: "2. Chọn vật tư",
    icon: Checklist,
    prevLabel: "Quay lại thông tin chung",
    nextLabel: "Tiếp theo: Nhập số lượng",
  },
  {
    value: "items",
    label: "3. Nhập số lượng & Xác nhận",
    icon: CheckCircle,
    prevLabel: "Quay lại chọn vật tư",
  },
]

type CreateInventoryReceiptReturnStepsTabsProps = {
  canGoToPicker: boolean
  canGoToItems: boolean
}

// Chỉ vẽ dải trigger — Tabs root (value/onValueChange) + TabsContent panel sống ở
// CreateInventoryReceiptReturnForm.tsx. Bước ① luôn mở được để quay lại đổi khách hàng.
export function CreateInventoryReceiptReturnStepsTabs({
  canGoToPicker,
  canGoToItems,
}: CreateInventoryReceiptReturnStepsTabsProps) {
  const disabledByStep: Record<InventoryReceiptReturnWizardStep, boolean> = {
    info: false,
    picker: !canGoToPicker,
    items: !canGoToItems,
  }

  return (
    <div className="border-b border-border">
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {stepItems.map((item) => {
          const disabled = disabledByStep[item.value]

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={disabled}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 hover:bg-muted/40",
                "data-active:text-primary",
                "group-data-[variant=line]/tabs-list:data-active:bg-primary/5",
                "after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5",
                disabled && "cursor-not-allowed opacity-60"
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
