import { Box, CheckCircle2, ListChecks } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type CreateOutsourcingOrderWizardTab = "picker" | "items" | "confirm"

type WizardTab = {
  value: CreateOutsourcingOrderWizardTab
  label: string
  icon: ComponentType<LucideProps>
}

// Nguồn duy nhất cho thứ tự + nhãn của 3 tab — CreateOutsourcingOrderForm.tsx suy tab
// trước/sau theo vị trí trong mảng này thay vì tự khai một danh sách nav riêng.
export const wizardTabs: WizardTab[] = [
  { value: "picker", label: "1. Chọn chi tiết cần gia công", icon: Box },
  { value: "items", label: "2. Số lượng & thông tin phiếu", icon: ListChecks },
  { value: "confirm", label: "3. Xác nhận & tạo phiếu", icon: CheckCircle2 },
]

type CreateOutsourcingOrderTabsProps = {
  tab: CreateOutsourcingOrderWizardTab
  canGoToItems: boolean
  canGoToConfirm: boolean
  onTabChange: (tab: CreateOutsourcingOrderWizardTab) => void
}

// Rập khuôn InventoryReceiptCreateFromPoStepsTabs.tsx / PurchaseRequestCreateStepsTabs.tsx — 3
// tab, tab ②/③ khoá tới khi có điều kiện tương ứng (xem CreateOutsourcingOrderForm.tsx's
// canGoToX). Tab ① luôn mở được để quay lại đổi lựa chọn.
export function CreateOutsourcingOrderTabs({
  tab,
  canGoToItems,
  canGoToConfirm,
  onTabChange,
}: CreateOutsourcingOrderTabsProps) {
  const disabledByTab: Record<CreateOutsourcingOrderWizardTab, boolean> = {
    picker: false,
    items: !canGoToItems,
    confirm: !canGoToConfirm,
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(value) =>
        onTabChange(value as CreateOutsourcingOrderWizardTab)
      }
      className="border-b border-border"
    >
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {wizardTabs.map((item) => {
          const isDisabled = disabledByTab[item.value]

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
