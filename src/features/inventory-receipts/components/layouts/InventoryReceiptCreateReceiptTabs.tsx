import { Box, Buildings2 } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InventoryReceiptCreateLane } from "@/features/inventory-receipts/schemas/create-inventory-receipt-lane-search.schema"

type LaneItem = {
  value: InventoryReceiptCreateLane
  label: string
  icon: ComponentType<IconProps>
}

const laneItems: LaneItem[] = [
  { value: "po", label: "Từ PO", icon: Box },
  { value: "return", label: "Khách hàng", icon: Buildings2 },
]

// Chỉ vẽ dải trigger — Tabs root (value/onValueChange) + TabsContent panel sống ở
// InventoryReceiptCreateReceiptPage.tsx, cùng cách ProductDetailTabs.tsx tách ("Only the
// triggers — the panels live in the page"). Không có prop khoá/disable như
// InventoryReceiptCreateFromPoStepsTabs.tsx — 2 làn không phụ thuộc dữ liệu lẫn nhau, luôn tự
// do chuyển qua lại.
export function InventoryReceiptCreateReceiptTabs() {
  return (
    <div className="border-b border-border">
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {laneItems.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5 hover:bg-muted/40 hover:text-foreground data-active:bg-primary/5 data-active:text-primary group-data-[variant=line]/tabs-list:data-active:bg-primary/5 data-active:hover:bg-primary/5"
          >
            <item.icon className="size-3.5" />
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
