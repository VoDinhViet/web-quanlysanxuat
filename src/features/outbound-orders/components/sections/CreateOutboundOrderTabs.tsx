import { Box, CheckCircle2, ListChecks } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type CreateOutboundOrderWizardTab = "picker" | "items" | "confirm"

type WizardTab = {
  value: CreateOutboundOrderWizardTab
  label: string
  icon: ComponentType<LucideProps>
}

// Nguồn duy nhất cho thứ tự + nhãn của 3 tab — CreateOutboundOrderForm.tsx suy tab trước/sau theo
// vị trí trong mảng này, cùng idiom CreateOutsourcingReceiptTabs.tsx.
export const wizardTabs: WizardTab[] = [
  { value: "picker", label: "1. Chọn PO/Job cần giao", icon: Box },
  { value: "items", label: "2. SL giao & thông tin phiếu", icon: ListChecks },
  { value: "confirm", label: "3. Xác nhận & tạo phiếu", icon: CheckCircle2 },
]

type CreateOutboundOrderTabsProps = {
  canGoToItems: boolean
  canGoToConfirm: boolean
}

// Chỉ vẽ dải trigger — Tabs root (selectedKey/onSelectionChange) + TabsContent panel sống ở
// CreateOutboundOrderForm.tsx, cùng cách tách ProductDetailTabs.tsx ("Only the triggers — the
// panels live in the page"). Tab ②/③ khoá tới khi có điều kiện tương ứng (xem
// CreateOutboundOrderForm.tsx's canGoToX). Tab ① luôn mở được để quay lại đổi lựa chọn.
export function CreateOutboundOrderTabs({
  canGoToItems,
  canGoToConfirm,
}: CreateOutboundOrderTabsProps) {
  const disabledByTab: Record<CreateOutboundOrderWizardTab, boolean> = {
    picker: false,
    items: !canGoToItems,
    confirm: !canGoToConfirm,
  }

  return (
    <div className="border-b border-border">
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {wizardTabs.map((item) => {
          const isDisabled = disabledByTab[item.value]

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
