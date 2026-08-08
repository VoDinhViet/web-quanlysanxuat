import { Link } from "@tanstack/react-router"
import { Eye, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/DisabledAction"
import { MissingFieldValue } from "@/components/shared/MissingFieldValue"
import type { PurchaseRequestProductionOrderRef } from "@/lib/types/purchase-request.type"

// "PO liên quan / Lý do": the backend has no `reason` column yet (giai đoạn 1 chỉ list, xem plan
// backend) — a manual PR (no linked LSX) has nothing to show here, so it falls back to
// MissingFieldValue instead of a silent "—" that would look like a genuinely empty field.
export function PurchaseRequestSourceCell({
  productionOrder,
}: {
  productionOrder: PurchaseRequestProductionOrderRef | null
}) {
  if (!productionOrder) {
    return <MissingFieldValue label="Chưa có API (lý do)" />
  }

  return productionOrder.code === null ? (
    <span>—</span>
  ) : (
    <span className="font-mono font-semibold text-primary">
      {productionOrder.code}
    </span>
  )
}

type PurchaseRequestActionsCellProps = {
  purchaseRequestId: string
}

// "Xem chi tiết" now has a real route (dữ liệu mẫu, xem PurchaseRequestDetailPage) — "Chỉnh sửa"
// stays disabled, there is still no write API (giai đoạn 1 chỉ có GET /purchase-requests).
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
