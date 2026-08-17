import { Box, CheckCircle2, ListChecks } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type CreateOutsourcingOrderWizardStep = "picker" | "items" | "confirm"

type StepItem = {
  value: CreateOutsourcingOrderWizardStep
  label: string
  icon: ComponentType<LucideProps>
}

const stepItems: StepItem[] = [
  { value: "picker", label: "1. Chọn chi tiết cần gia công", icon: Box },
  { value: "items", label: "2. Số lượng & thông tin phiếu", icon: ListChecks },
  { value: "confirm", label: "3. Xác nhận & tạo phiếu", icon: CheckCircle2 },
]

type CreateOutsourcingOrderStepsTabsProps = {
  step: CreateOutsourcingOrderWizardStep
  canGoToItems: boolean
  canGoToConfirm: boolean
  onStepChange: (step: CreateOutsourcingOrderWizardStep) => void
}

// Rập khuôn InventoryReceiptCreateFromPoStepsTabs.tsx / PurchaseRequestCreateStepsTabs.tsx — 3
// bước, bước ②/③ khoá tới khi có điều kiện tương ứng (xem CreateOutsourcingOrderForm.tsx's
// canGoToX). Bước ① luôn mở được để quay lại đổi lựa chọn.
export function CreateOutsourcingOrderStepsTabs({
  step,
  canGoToItems,
  canGoToConfirm,
  onStepChange,
}: CreateOutsourcingOrderStepsTabsProps) {
  const disabledByStep: Record<CreateOutsourcingOrderWizardStep, boolean> = {
    picker: false,
    items: !canGoToItems,
    confirm: !canGoToConfirm,
  }

  return (
    <Tabs
      value={step}
      onValueChange={(value) =>
        onStepChange(value as CreateOutsourcingOrderWizardStep)
      }
      className="border-b border-border"
    >
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {stepItems.map((item) => {
          const isDisabled = disabledByStep[item.value]

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={isDisabled}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
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
