import { Link } from "@tanstack/react-router"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

// Renders the first source code + a "+N" suffix for the rest — a PO can gather lines from
// several PRs at once (see PurchaseOrderSourceRef in purchase-order.type.ts), so a single-code
// cell would silently drop data.
type PurchaseOrderSourceCellProps = {
  codes: string[]
}

export function PurchaseOrderSourceCell({
  codes,
}: PurchaseOrderSourceCellProps) {
  if (codes.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <span className="font-mono text-xs font-semibold text-primary">
      {codes[0]}
      {codes.length > 1 && (
        <span className="ml-1 font-sans font-normal text-muted-foreground">
          +{codes.length - 1}
        </span>
      )}
    </span>
  )
}

const amountFormatter = new Intl.NumberFormat("vi-VN")

type PurchaseOrderAmountCellProps = {
  value: number
}

export function PurchaseOrderAmountCell({
  value,
}: PurchaseOrderAmountCellProps) {
  return (
    <span className="font-semibold text-foreground tabular-nums">
      {amountFormatter.format(value)}
    </span>
  )
}

type PurchaseOrderActionsCellProps = {
  purchaseOrderId: string
}

// "Xem chi tiết" now has a real route — see PurchaseOrderDetailPage.
export function PurchaseOrderActionsCell({
  purchaseOrderId,
}: PurchaseOrderActionsCellProps) {
  return (
    <div className="flex items-center justify-center">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="bg-background text-muted-foreground"
        aria-label="Xem chi tiết"
        asChild
      >
        <Link
          to="/manage/purchase-orders/$purchaseOrderId"
          params={{ purchaseOrderId }}
        >
          <Eye className="size-3.5" />
        </Link>
      </Button>
    </div>
  )
}
