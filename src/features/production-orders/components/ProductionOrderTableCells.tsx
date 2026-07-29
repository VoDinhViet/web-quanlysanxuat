import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { Eye, Pencil } from "lucide-react"

import { IconButton } from "@/components/shared/IconButton"
import { resolveDeliveryTone } from "@/lib/types/order.type"
import type { DeliveryTone, Order } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

// Duplicated from OrderTableCells.tsx rather than imported — a feature may only
// read another feature's data through its api/index.ts barrel, never its
// components (see .claude/rules/architecture.md "Layer boundaries").
const DELIVERY_TONE_CLASSNAME: Record<DeliveryTone, string> = {
  overdue: "text-destructive",
  "near-due": "text-warning",
  normal: "text-foreground",
}

export function DueDateCell({ order }: { order: Order }) {
  return (
    <span
      className={cn(
        "font-medium",
        DELIVERY_TONE_CLASSNAME[resolveDeliveryTone(order)]
      )}
    >
      {order.dueDate === null
        ? "—"
        : DateTime.fromISO(order.dueDate).toFormat("dd/MM/yyyy")}
    </span>
  )
}

// "Xem" links to the order itself (thông tin đơn hàng gốc); "Sửa LSX" links to the LSX
// decision/detail screen (số lượng sản xuất, duyệt LSX) — a different resource than the order.
export function ProductionOrderActionsCell({ order }: { order: Order }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <IconButton label="Xem đơn hàng" asChild>
        <Link to="/manage/orders/$orderId" params={{ orderId: order.id }}>
          <Eye className="size-3.5" />
        </Link>
      </IconButton>

      <IconButton label="Sửa LSX" asChild>
        <Link
          to="/manage/production-orders/$orderId"
          params={{ orderId: order.id }}
        >
          <Pencil className="size-3.5" />
        </Link>
      </IconButton>
    </div>
  )
}
