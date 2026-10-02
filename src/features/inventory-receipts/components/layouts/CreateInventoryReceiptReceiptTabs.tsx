import { Box, Buildings2, Inbox } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  InventoryReceiptType,
  inventoryReceiptTypeLabels,
} from "@/lib/types/inventory-receipt.type"
import type { CreateInventoryReceiptLane } from "@/features/inventory-receipts/schemas/create-inventory-receipt-lane-search.schema"

type LaneItem = {
  value: CreateInventoryReceiptLane
  receiptType: InventoryReceiptType
  icon: ComponentType<IconProps>
}

// Tab labels are the backend's receipt-type names (`inventoryReceiptTypeLabels`), so a lane reads the
// same here as on the receipt list/detail.
const laneItems: LaneItem[] = [
  { value: "po", receiptType: InventoryReceiptType.PURCHASE, icon: Box },
  {
    value: "return",
    receiptType: InventoryReceiptType.RETURN,
    icon: Buildings2,
  },
  { value: "other", receiptType: InventoryReceiptType.OTHER, icon: Inbox },
]

// Chỉ vẽ dải trigger — Tabs root (value/onValueChange) + TabsContent panel sống ở
// CreateInventoryReceiptReceiptPage.tsx, cùng cách ProductDetailTabs.tsx tách ("Only the
// triggers — the panels live in the page"). Không có prop khoá/disable như
// CreateInventoryReceiptFromPoStepsTabs.tsx — 3 làn không phụ thuộc dữ liệu lẫn nhau, luôn tự
// do chuyển qua lại.
export function CreateInventoryReceiptReceiptTabs() {
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
            className="h-12 flex-none gap-2 rounded-none px-4 capitalize after:bg-primary group-data-horizontal/tabs:after:-bottom-px hover:bg-muted/40 data-active:text-primary group-data-[variant=line]/tabs-list:data-active:bg-primary/5"
          >
            <item.icon className="size-3.5" />
            {inventoryReceiptTypeLabels[item.receiptType]}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
