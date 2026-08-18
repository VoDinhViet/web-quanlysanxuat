import { Box, CheckCircle, Checklist, Eye } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type InventoryReceiptFromPoWizardStep =
  | "po"
  | "preview"
  | "items"
  | "confirm"

type StepItem = {
  value: InventoryReceiptFromPoWizardStep
  label: string
  icon: ComponentType<IconProps>
}

export const stepItems: StepItem[] = [
  { value: "po", label: "1. Chọn PO cần nhập", icon: Box },
  { value: "preview", label: "2. Xem trước đơn mua", icon: Eye },
  { value: "items", label: "3. Nhập SL & QC", icon: Checklist },
  { value: "confirm", label: "4. Lưu nháp / Xác nhận", icon: CheckCircle },
]

type InventoryReceiptCreateFromPoStepsTabsProps = {
  canGoToPreview: boolean
  canGoToItems: boolean
  canGoToConfirm: boolean
}

// Chỉ vẽ dải trigger — Tabs root (value/onValueChange) + TabsContent panel sống ở
// InventoryReceiptCreateFromPoForm.tsx, cùng cách tách ProductDetailTabs.tsx ("Only the triggers
// — the panels live in the page"). 4 bước, mỗi bước có điều kiện riêng để mở khoá (xem
// InventoryReceiptCreateFromPoForm.tsx's canGoToX). Bước ① luôn mở được để quay lại đổi PO.
export function InventoryReceiptCreateFromPoStepsTabs({
  canGoToPreview,
  canGoToItems,
  canGoToConfirm,
}: InventoryReceiptCreateFromPoStepsTabsProps) {
  const disabledByStep: Record<InventoryReceiptFromPoWizardStep, boolean> = {
    po: false,
    preview: !canGoToPreview,
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
    </div>
  )
}
