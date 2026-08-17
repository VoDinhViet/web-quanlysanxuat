import { Link } from "@tanstack/react-router"
import { Eye, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import type { PurchaseRequestProductionOrderRef } from "@/lib/types/purchase-request.type"

// "PO liên quan / Lý do": a request auto-generated from a LSX shows its production order code; a
// manually-created request that got rejected shows why; anything else (manual + not rejected)
// genuinely has neither, so it's a plain "—" rather than a placeholder.
export function PurchaseRequestSourceCell({
  productionOrder,
  status,
  rejectionReason,
}: {
  productionOrder: PurchaseRequestProductionOrderRef | null
  status: PurchaseRequestStatus
  rejectionReason: string | null
}) {
  if (productionOrder) {
    return productionOrder.code === null ? (
      <span>—</span>
    ) : (
      <span className="font-mono font-semibold text-primary">
        {productionOrder.code}
      </span>
    )
  }

  if (status === PurchaseRequestStatus.REJECTED && rejectionReason) {
    return <span>{rejectionReason}</span>
  }

  return <span>—</span>
}

type PurchaseRequestActionsCellProps = {
  purchaseRequestId: string
}

// "Xem chi tiết" links to the real detail route. "Chỉnh sửa" stays disabled — send/approve/reject
// and item-level writes are wired, but the backend has no generic header-update endpoint (no
// PATCH /purchase-requests/:id) to power an edit screen.
export function PurchaseRequestActionsCell({
  purchaseRequestId,
}: PurchaseRequestActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="bg-background text-muted-foreground"
        aria-label="Xem chi tiết"
        asChild
      >
        <Link
          to="/manage/purchase-requests/$purchaseRequestId"
          params={{ purchaseRequestId }}
        >
          <Eye className="size-3.5" />
        </Link>
      </Button>
      <DisabledAction label="Chỉnh sửa">
        <Pencil className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
