import { Download, Plus, RotateCw } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ProductionOrdersFilterActionsProps = {
  onReset: () => void
}

export function ProductionOrdersFilterActions({
  onReset,
}: ProductionOrdersFilterActionsProps) {
  return (
    <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
      <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
        <Download className="size-4" />
        Xuất Excel
      </PendingAction>

      <Button
        type="button"
        variant="outline"
        className="text-xs"
        onClick={onReset}
      >
        <RotateCw className="size-4" />
        Làm mới
      </Button>

      <PendingAction label="Tạo LSX" hint="Màn hình tạo LSX sắp có">
        <Plus className="size-4" />
        Tạo LSX
      </PendingAction>
    </div>
  )
}

type PendingActionProps = {
  label: string
  hint: string
  children: ReactNode
}

// Neither the LSX detail/decision screen nor the Excel export exist yet — both
// stay disabled with the generic hint idiom, same as OrdersFilterActions.tsx.
// The <span tabIndex={0}> wrapper is load-bearing: a disabled button swallows
// pointer events, so the tooltip would never fire without it.
function PendingAction({ label, hint, children }: PendingActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button
            type="button"
            variant="outline"
            className="pointer-events-none text-xs"
            aria-label={label}
            disabled
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
