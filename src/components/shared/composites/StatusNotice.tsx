import { DateTime } from "luxon"
import { TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type StatusNoticeProps = {
  title: string
  reason: string
  actorName?: string | null
  timestamp?: string | null
  // The one call site (PurchaseRequestRejectionNotice.tsx) that needs a 3rd line — a hint shown
  // only in one of its 2 gated statuses.
  extra?: ReactNode
  className?: string
}

// The destructive-tone banner a detail page opens with when its entity was rejected/cancelled —
// title, reason, an optional actor+timestamp line. Each domain keeps its own gate (which
// status(es) trigger it, whether the title varies by status) and its own field names
// (rejection* vs cancellation*) in a thin wrapper that returns null when the gate fails — see
// PurchaseOrderCancellationNotice.tsx. Matches the hand-rolled shape shared by purchase-orders/
// purchase-quotations/purchase-requests; orders/outbound-orders use a visually similar but
// structurally different shadcn-Alert-based shape that hasn't migrated onto this one yet.
export function StatusNotice({
  title,
  reason,
  actorName,
  timestamp,
  extra,
  className,
}: StatusNoticeProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5",
        className
      )}
    >
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-destructive">{title}</p>
        <p className="text-sm text-foreground">{reason}</p>
        {actorName && timestamp ? (
          <p className="text-xs text-muted-foreground">
            {actorName} ·{" "}
            {DateTime.fromISO(timestamp).toFormat("dd/MM/yyyy HH:mm")}
          </p>
        ) : null}
        {extra}
      </div>
    </div>
  )
}
