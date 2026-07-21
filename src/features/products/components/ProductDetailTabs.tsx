import { Fragment } from "react"
import { Icon } from "@iconify/react"
import boxBold from "@iconify-icons/solar/box-bold"
import clipboardListBold from "@iconify-icons/solar/clipboard-list-bold"
import historyBold from "@iconify-icons/solar/history-bold"
import layersBold from "@iconify-icons/solar/layers-bold"
import { Lock } from "lucide-react"
import type { IconifyIcon } from "@iconify/types"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ProductDetailTab } from "@/features/products/schemas/product-detail-search.schema"
import { cn } from "@/lib/utils"

type ProductDetailTabItem = {
  value: ProductDetailTab
  label: string
  icon: IconifyIcon
}

const PRODUCT_DETAIL_TAB_ITEMS: ProductDetailTabItem[] = [
  { value: "info", label: "Thông tin sản phẩm", icon: boxBold },
  { value: "structure", label: "Cấu trúc & Công đoạn", icon: layersBold },
  {
    value: "materials",
    label: "Thành phần vật tư",
    icon: clipboardListBold,
  },
  { value: "revisions", label: "Lịch sử Revision", icon: historyBold },
]

type ProductDetailTabsProps = {
  // Tabs the current screen can't reach yet. The create page locks 2, 3 and 4
  // because they need a saved product id.
  lockedTabs?: ProductDetailTab[]
  lockedHint?: string
}

// Only the triggers — the panels live in the page so the page owns the
// two-column grid that each panel shares with the sidebar.
export function ProductDetailTabs({
  lockedTabs = [],
  lockedHint,
}: ProductDetailTabsProps) {
  return (
    <div className="border-b border-border print:hidden">
      {/* `group-data-horizontal/tabs:h-auto`, not plain `h-auto`: the list's cva
          base pins the height with that same variant chain, and tailwind-merge
          only dedupes when the chains match — otherwise the list stays 36px
          while the 48px triggers overflow it, leaving the active indicator
          stranded below the border. */}
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {PRODUCT_DETAIL_TAB_ITEMS.map((item) => {
          const isLocked = lockedTabs.includes(item.value)

          const trigger = (
            <TabsTrigger
              value={item.value}
              disabled={isLocked}
              className={cn(
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
                // Every override below has to repeat the primitive's own
                // variant chain verbatim — tailwind-merge only dedupes classes
                // whose chains match exactly. The primitive sets the active
                // background twice: a plain `data-active:bg-background` and a
                // line-variant-scoped `group-data-[variant=line]/tabs-list:
                // data-active:bg-transparent` that wins for this list
                // (variant="line"). Both chains have to be matched here, or
                // the second one silently keeps the background transparent
                // regardless of what the first override says.
                "data-active:bg-primary/5 data-active:text-primary",
                "group-data-[variant=line]/tabs-list:data-active:bg-primary/5",
                // Hovering an active tab: without this, `hover:bg-muted/40`
                // above and the active tint are equal-specificity single-variant
                // rules, so which one paints is generation-order luck. This
                // compound variant is strictly more specific than either,
                // so the active tint reliably wins over the neutral hover.
                "data-active:hover:bg-primary/5",
                // Indicator: the primitive parks it at `bottom-[-5px]`, sized
                // for the list's default `p-[3px]`. This list is `p-0`, so drop
                // it to -1px — the 2px bar then covers the wrapper's 1px bottom
                // border instead of stacking on top of it.
                "after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5",
                isLocked && "cursor-not-allowed opacity-60"
              )}
            >
              {isLocked ? (
                <Lock className="size-3.5" />
              ) : (
                <Icon icon={item.icon} className="size-3.5" />
              )}
              {item.label}
            </TabsTrigger>
          )

          if (!isLocked || !lockedHint) {
            return <Fragment key={item.value}>{trigger}</Fragment>
          }

          return (
            <Tooltip key={item.value}>
              {/* A disabled trigger swallows pointer events, so the tooltip
                  hangs off a wrapper rather than the trigger itself. */}
              <TooltipTrigger asChild>
                <span className="flex">{trigger}</span>
              </TooltipTrigger>
              <TooltipContent>{lockedHint}</TooltipContent>
            </Tooltip>
          )
        })}
      </TabsList>
    </div>
  )
}
