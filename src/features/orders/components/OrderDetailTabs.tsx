import { Fragment } from "react"
import { Icon } from "@iconify/react"
import boxBold from "@iconify-icons/solar/box-bold"
import card2Bold from "@iconify-icons/solar/card-2-bold"
import deliveryBold from "@iconify-icons/solar/delivery-bold"
import infoCircleBold from "@iconify-icons/solar/info-circle-bold"
import notesBold from "@iconify-icons/solar/notes-bold"
import routingBold from "@iconify-icons/solar/routing-bold"
import { Lock } from "lucide-react"
import type { IconifyIcon } from "@iconify/types"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const LOCKED_TAB_HINT = "Tính năng sắp có"

type OrderDetailTabItem = {
  value: string
  label: string
  icon: IconifyIcon
  // Tabs with no backend data source yet (no DO/payment/production-progress
  // tracking on an order) — rendered so the page's information architecture
  // reads complete, same "disabled trigger + tooltip" idiom as
  // ProductDetailTabs' lockedTabs, just permanent rather than conditional.
  locked: boolean
}

type OrderDetailTabsProps = {
  itemCount: number
}

// Only the triggers — the panels live in the page, same split as ProductDetailTabs.
export function OrderDetailTabs({ itemCount }: OrderDetailTabsProps) {
  const items: OrderDetailTabItem[] = [
    {
      value: "info",
      label: "Thông tin chung",
      icon: infoCircleBold,
      locked: false,
    },
    {
      value: "items",
      label: `Sản phẩm (${itemCount})`,
      icon: boxBold,
      locked: false,
    },
    {
      value: "progress",
      label: "Tiến độ thực hiện",
      icon: routingBold,
      locked: true,
    },
    {
      value: "deliveries",
      label: "Lịch sử giao hàng",
      icon: deliveryBold,
      locked: true,
    },
    {
      value: "payments",
      label: "Lịch sử thanh toán",
      icon: card2Bold,
      locked: true,
    },
    {
      value: "notes",
      label: "Ghi chú & Đính kèm",
      icon: notesBold,
      locked: false,
    },
  ]

  return (
    <div className="border-b border-border print:hidden">
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 overflow-x-auto rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {items.map((item) => {
          const trigger = (
            <TabsTrigger
              value={item.value}
              disabled={item.locked}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
                "data-active:bg-primary/5 data-active:text-primary",
                "group-data-[variant=line]/tabs-list:data-active:bg-primary/5",
                "data-active:hover:bg-primary/5",
                "after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5",
                item.locked && "cursor-not-allowed opacity-60"
              )}
            >
              {item.locked ? (
                <Lock className="size-3.5" />
              ) : (
                <Icon icon={item.icon} className="size-3.5" />
              )}
              {item.label}
            </TabsTrigger>
          )

          if (!item.locked) {
            return <Fragment key={item.value}>{trigger}</Fragment>
          }

          return (
            <Tooltip key={item.value}>
              {/* A disabled trigger swallows pointer events, so the tooltip
                  hangs off a wrapper rather than the trigger itself. */}
              <TooltipTrigger asChild>
                <span className="flex">{trigger}</span>
              </TooltipTrigger>
              <TooltipContent>{LOCKED_TAB_HINT}</TooltipContent>
            </Tooltip>
          )
        })}
      </TabsList>
    </div>
  )
}
