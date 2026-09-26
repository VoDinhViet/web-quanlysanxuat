import { Box, Ruler } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Badge } from "@/components/ui/badge"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type CreateDirectWizardStep = "select" | "details"

type CreateDirectStepItem = WizardStepNavItem<CreateDirectWizardStep> & {
  label: string
  icon: ComponentType<IconProps>
}

export const createDirectStepItems: CreateDirectStepItem[] = [
  {
    value: "select",
    label: "1. Chọn vật tư",
    icon: Box,
    nextLabel: "Tiếp theo: Số lượng & ghi chú",
  },
  {
    value: "details",
    label: "2. Số lượng & ghi chú",
    icon: Ruler,
    prevLabel: "Quay lại chọn vật tư",
  },
]

type CreateDirectStepsTabsProps = {
  // Bước ② chỉ mở khi đã chọn ít nhất 1 vật tư — xem CreateDirectDialog.tsx's `picked.size`.
  canGoToDetails: boolean
  // Hiện badge số lượng đã chọn ngay trên tab ② — chỉ chỗ này cần con số này, không lặp lại ở
  // thanh tìm kiếm của bước ① (DirectsPickerTable.tsx) nữa.
  pickedCount: number
}

// Chỉ vẽ dải trigger — Tabs root + TabsContent panel sống ở CreateDirectDialog.tsx, cùng cách
// CreateInventoryReceiptFromPoStepsTabs.tsx tách (dùng @solar-icons/react nên không qua
// WizardStepsTabs dùng chung — component đó cố định kiểu icon lucide-react).
export function CreateDirectStepsTabs({
  canGoToDetails,
  pickedCount,
}: CreateDirectStepsTabsProps) {
  return (
    <div className="border-b border-border">
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {createDirectStepItems.map((item) => {
          const disabled = item.value === "details" && !canGoToDetails

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={disabled}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
                "data-selected:bg-primary/5 data-selected:text-primary",
                "group-data-[variant=line]/tabs-list:data-selected:bg-primary/5",
                "data-selected:hover:bg-primary/5",
                "after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
              {item.value === "details" && pickedCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {pickedCount}
                </Badge>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </div>
  )
}
