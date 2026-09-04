import { DateTime } from "luxon"
import { Eye, Pencil, Trash2 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { DeleteOrderDialog } from "@/features/orders/components/composites/DeleteOrderDialog"
import {
  canUpdateOrder,
  OrderStatus,
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
// "Xoá" only works while DRAFT (backend gate E264) — every other status keeps DisabledAction, same
// idiom as OutboundOrderActionsCell.
export function OrderActionsCell({ order }: { order: Order }) {
  const isEditable = canUpdateOrder(order.status)
  const isDraft = order.status === OrderStatus.DRAFT

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
      {isDraft ? (
        <PermissionGate permission="orders:delete">
          <DeleteOrderDialog
            order={order}
            trigger={
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Xoá đơn hàng"
                  className="border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Tooltip>Xoá đơn hàng</Tooltip>
              </TooltipTrigger>
            }
          />
        </PermissionGate>
      ) : (
        <DisabledAction
          label="Xoá đơn hàng"
          hint="chỉ xoá được khi đơn ở trạng thái Nháp"
        >
          <Trash2 className="size-3.5" />
        </DisabledAction>
      )}
    </div>
  )
}
