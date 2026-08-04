import { Filter, Plus, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type PurchaseRequestsFilterActionsProps = {
  onApplySearch: () => void
  onReset: () => void
}

export function PurchaseRequestsFilterActions({
  onApplySearch,
  onReset,
}: PurchaseRequestsFilterActionsProps) {
  return (
    <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
      {/* Select/DateRangeFilter already apply live on change (app-wide convention) — this only
          flushes the search box's 300ms debounce immediately, same effect as pressing Enter in
          it. Not a "select then apply" gate over the other fields. */}
      <Button
        type="button"
        variant="outline"
        className="text-xs"
        onClick={onApplySearch}
      >
        <Filter className="size-4" />
        Bộ lọc
      </Button>

      <Button
        type="button"
        variant="outline"
        className="text-xs"
        onClick={onReset}
      >
        <RotateCw className="size-4" />
        Làm mới
      </Button>

      {/* variant="default" (primary), not the outline every other PendingAction uses — matches
          the reference mockup (UI_PR_01) exactly, which shows this button primary-colored even
          though the create screen isn't built yet. Deliberate deviation, not a missed rename. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button
              type="button"
              variant="default"
              className="pointer-events-none text-xs"
              aria-label="Tạo đề xuất mua hàng (Manual)"
              disabled
            >
              <Plus className="size-4" />
              Tạo đề xuất mua hàng (Manual)
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Màn hình tạo đề xuất mua hàng sắp có</TooltipContent>
      </Tooltip>
    </div>
  )
}
