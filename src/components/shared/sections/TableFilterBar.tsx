import { RotateCw } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TableFilterBarProps = {
  // Both omitted together skip the "create" section entirely — a filter bar with no create
  // action.
  createLabel?: string
  createAction?: ReactNode
  // The filter fields' own grid — its column template varies by field count/width per domain,
  // so it's a slot rather than a fixed `grid` div here. See TableSearchInput/FilterSelect for
  // the individual field shells.
  fields: ReactNode
  onReset: () => void
  className?: string
}

// The shell every table filter bar reuses: an optional labeled "create" row, a filter-field
// region, and a "Xóa bộ lọc" reset button pinned to the end. See
// InventoryRequisitionsTableFilter.tsx for a call site.
export function TableFilterBar({
  createLabel,
  createAction,
  fields,
  onReset,
  className,
}: TableFilterBarProps) {
  return (
    <div
      className={cn("flex flex-col gap-5 bg-card px-4 py-4 lg:px-5", className)}
    >
      {createAction && (
        <div className="border-b border-border/60 pb-4">
          <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {createLabel}
          </p>
          <div className="flex flex-wrap gap-2">{createAction}</div>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        {fields}

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={onReset}
          >
            <RotateCw className="size-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  )
}
