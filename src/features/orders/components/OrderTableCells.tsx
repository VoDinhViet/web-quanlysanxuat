import { DateTime } from "luxon"
import { Eye, Pencil } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { resolveDeliveryTone } from "@/features/orders/types/order.type"
import type { DeliveryTone, Order } from "@/features/orders/types/order.type"
import { cn } from "@/lib/utils"

// Plain grouping, not style: "currency" — the column header already says (VND),
// so "125.000.000.000 ₫" would repeat it.
const currencyFormatter = new Intl.NumberFormat("vi-VN")

const DELIVERY_TONE_CLASSNAME: Record<DeliveryTone, string> = {
  overdue: "text-destructive",
  "near-due": "text-orange-600",
  normal: "text-foreground",
}

export function MoneyCell({ value }: { value: number }) {
  return <>{currencyFormatter.format(value)}</>
}

export function DateCell({ value }: { value: string }) {
  return <>{DateTime.fromISO(value).toFormat("dd/MM/yyyy")}</>
}

export function DeliveryDateCell({ order }: { order: Order }) {
  return (
    <span
      className={cn(
        "font-medium",
        DELIVERY_TONE_CLASSNAME[resolveDeliveryTone(order)]
      )}
    >
      {DateTime.fromISO(order.deliveryDate).toFormat("dd/MM/yyyy")}
    </span>
  )
}

// Create/detail/edit screens don't exist yet. A <Link> to an unregistered route
// wouldn't typecheck and a raw <a> would 404, so these say what's true: the
// feature is coming. The <span tabIndex={0}> wrapper is required — a disabled
// button swallows pointer events and the tooltip would never fire.
export function OrderActionsCell() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <DisabledAction label="Xem chi tiết">
        <Eye className="size-3.5" />
      </DisabledAction>
      <DisabledAction label="Chỉnh sửa">
        <Pencil className="size-3.5" />
      </DisabledAction>
    </div>
  )
}

type DisabledActionProps = {
  label: string
  children: ReactNode
}

function DisabledAction({ label, children }: DisabledActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="pointer-events-none bg-background text-muted-foreground"
            aria-label={label}
            disabled
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{`${label} — tính năng sắp có`}</TooltipContent>
    </Tooltip>
  )
}
