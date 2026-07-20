import { Download, Plus, RotateCw } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/PermissionGate"

type OrdersFilterActionsProps = {
  onReset: () => void
}

export function OrdersFilterActions({ onReset }: OrdersFilterActionsProps) {
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

      <PermissionGate permission="orders:create">
        <PendingAction
          label="Tạo đơn hàng"
          hint="Chức năng tạo đơn hàng sắp có"
          isPrimary
        >
          <Plus className="size-4" />
          Tạo đơn hàng
        </PendingAction>
      </PermissionGate>
    </div>
  )
}

type PendingActionProps = {
  label: string
  hint: string
  isPrimary?: boolean
  children: ReactNode
}

// The screen behind this button doesn't exist yet. A <Link> to an unregistered
// route wouldn't typecheck and a raw <a> would 404, so it stays disabled and
// says so. The <span tabIndex={0}> wrapper is load-bearing: a disabled button
// swallows pointer events, so the tooltip would never fire without it.
function PendingAction({
  label,
  hint,
  isPrimary,
  children,
}: PendingActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button
            type="button"
            variant={isPrimary ? "default" : "outline"}
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
