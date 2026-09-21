import { Eye, Pencil } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
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
      <LinkButton
        to="/manage/purchase-requests/$purchaseRequestId"
        params={{ purchaseRequestId }}
        variant="outline"
        size="icon-sm"
        className="bg-background text-muted-foreground"
        aria-label="Xem chi tiết"
      >
        <Eye className="size-3.5" />
      </LinkButton>
      <DisabledAction label="Chỉnh sửa">
        <Pencil className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
