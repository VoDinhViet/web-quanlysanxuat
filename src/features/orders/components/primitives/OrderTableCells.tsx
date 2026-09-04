import { DateTime } from "luxon"
import { Eye, Pencil } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import {
  canUpdateOrder,
  resolveDeliveryTone,
  resolveOrderUpdateDisabledHint,
} from "@/lib/types/order.type"
import type { DeliveryTone, Order } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

// Plain grouping, not style: "currency" — the column header already says (VND),
// so "125.000.000.000 ₫" would repeat it.
const currencyFormatter = new Intl.NumberFormat("vi-VN")

const deliveryToneClassName: Record<DeliveryTone, string> = {
  overdue: "text-destructive",
  "near-due": "text-warning",
  normal: "text-foreground",
}

export function MoneyCell({ value }: { value: number }) {
  return <>{currencyFormatter.format(value)}</>
}

export function DateCell({ value }: { value: string }) {
  return <>{DateTime.fromISO(value).toFormat("dd/MM/yyyy")}</>
}

export function DueDateCell({ order }: { order: Order }) {
  return (
    <span
      className={cn(
        "font-medium",
        deliveryToneClassName[resolveDeliveryTone(order)]
      )}
    >
      {order.dueDate === null
        ? "—"
        : DateTime.fromISO(order.dueDate).toFormat("dd/MM/yyyy")}
    </span>
  )
}

// A COMPLETED/CANCELLED order can't be edited (backend rejects the PATCH with
// order.error.not_editable, and the update route's own loader redirects away); PENDING_CONFIRMATION
// and everything from AWAITING_PRODUCTION onward can't either, but those are a front-end-only rule
// (the backend still accepts the PATCH) — see canUpdateOrder. Either way "Chỉnh sửa" stays disabled
// with a status-specific hint. Otherwise it links to the update screen, gated on `orders:update`
// same as the create button on the toolbar. The <span tabIndex={0}> wrapper on the disabled action
// is required — a disabled button swallows pointer events and the tooltip would never fire.
export function OrderActionsCell({ order }: { order: Order }) {
  const isEditable = canUpdateOrder(order.status)

  return (
    <div className="flex items-center justify-center gap-1.5">
      <TooltipTrigger>
        <LinkButton
          to="/manage/orders/$orderId"
          params={{ orderId: order.id }}
          variant="outline"
          size="icon-sm"
          aria-label="Xem chi tiết"
        >
          <Eye className="size-3.5" />
        </LinkButton>
        <Tooltip>Xem chi tiết</Tooltip>
      </TooltipTrigger>
      {isEditable ? (
        <RoutePermissionGate route="/manage/orders/$orderId/update">
          <TooltipTrigger>
            <LinkButton
              to="/manage/orders/$orderId/update"
              params={{ orderId: order.id }}
              variant="outline"
              size="icon-sm"
              aria-label="Chỉnh sửa"
            >
              <Pencil className="size-3.5" />
            </LinkButton>
            <Tooltip>Chỉnh sửa</Tooltip>
          </TooltipTrigger>
        </RoutePermissionGate>
      ) : (
        <DisabledAction
          label="Chỉnh sửa"
          hint={resolveOrderUpdateDisabledHint(order.status)}
        >
          <Pencil className="size-3.5" />
        </DisabledAction>
      )}
    </div>
  )
}
