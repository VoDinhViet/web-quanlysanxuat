import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { Eye, Pencil } from "lucide-react"

import { IconButton } from "@/components/shared/buttons/IconButton"
import type { DeliveryTone } from "@/lib/types/order.type"
import type { ProductionOrder } from "@/lib/types/production-order.type"
import { cn } from "@/lib/utils"

// Duplicated from OrderTableCells.tsx rather than imported — a feature may only
// read another feature's data through its api/index.ts barrel, never its
// components (see .claude/rules/architecture.md "Layer boundaries").
const deliveryToneClassName: Record<DeliveryTone, string> = {
  overdue: "text-destructive",
  "near-due": "text-warning",
  normal: "text-foreground",
}

// Days before dueDate at which the date turns orange — mirrors order.type.ts's own (unexported)
// nearDueDays. Only the date math is reproduced here, not order.type.ts's `expired`/OrderStatus
// branches: GET /production-orders only ever returns rows whose order is
// AWAITING_PRODUCTION/IN_PROGRESS (never COMPLETED), so a plain date compare is equivalent for
// this list — see ProductionOrdersService.ORDERS_IN_SCOPE in the backend.
const nearDueDays = 3

function resolveProductionDueDateTone(dueDate: string | null): DeliveryTone {
  if (dueDate === null) {
    return "normal"
  }

  const daysLeft = DateTime.fromISO(dueDate)
    .startOf("day")
    .diff(DateTime.now().startOf("day"), "days").days

  if (daysLeft < 0) {
    return "overdue"
  }

  return daysLeft <= nearDueDays ? "near-due" : "normal"
}

export function DueDateCell({
  dueDate,
}: {
  dueDate: ProductionOrder["dueDate"]
}) {
  return (
    <span
      className={cn(
        "font-medium",
        deliveryToneClassName[resolveProductionDueDateTone(dueDate)]
      )}
    >
      {dueDate === null
        ? "—"
        : DateTime.fromISO(dueDate).toFormat("dd/MM/yyyy")}
    </span>
  )
}

// "Xem" links to the order itself (thông tin đơn hàng gốc), keyed by `row.orderId`; "Sửa LSX"
// links to the LSX detail screen, keyed by `row.id` (the production order's own id) — the two ids
// are different resources, both carried on the same list row.
export function ProductionOrderActionsCell({ row }: { row: ProductionOrder }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <IconButton label="Xem đơn hàng" asChild>
        <Link to="/manage/orders/$orderId" params={{ orderId: row.orderId }}>
          <Eye className="size-3.5" />
        </Link>
      </IconButton>

      <IconButton label="Sửa LSX" asChild>
        <Link
          to="/manage/production-orders/$productionOrderId"
          params={{ productionOrderId: row.id }}
        >
          <Pencil className="size-3.5" />
        </Link>
      </IconButton>
    </div>
  )
}
