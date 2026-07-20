import { Fragment } from "react"
import { Lock } from "lucide-react"

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
}

const PRODUCT_DETAIL_TAB_ITEMS: ProductDetailTabItem[] = [
  { value: "info", label: "1. Thông tin sản phẩm" },
  { value: "structure", label: "2. Cấu trúc sản phẩm & Công đoạn" },
  { value: "materials", label: "3. Thành phần vật tư" },
]

type ProductDetailTabsProps = {
  // Tabs the current screen can't reach yet. The create page locks 2 and 3
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
                "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground hover:text-foreground",
                // Every override below has to repeat the primitive's own
                // variant chain verbatim. tailwind-merge only dedupes classes
                // whose chains match, so `data-active:bg-transparent` clears
                // the primitive's `data-active:bg-background` while the
                // line-variant's chain-mismatched `...:bg-transparent` cannot.
                "data-active:bg-transparent data-active:text-primary",
                // Indicator: the primitive parks it at `bottom-[-5px]`, sized
                // for the list's default `p-[3px]`. This list is `p-0`, so drop
                // it to -1px — the 2px bar then covers the wrapper's 1px bottom
                // border instead of stacking on top of it.
                "after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5",
                isLocked && "cursor-not-allowed opacity-60"
              )}
            >
              {isLocked ? <Lock className="size-3.5" /> : null}
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
