import { Eye } from "lucide-react"

import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { PurchaseLedgerWarningBadge } from "@/features/purchase-ledger/components/primitives/PurchaseLedgerBadges"
import { cn } from "@/lib/utils"
import type {
  PurchaseLedgerProductionOrderRef,
  PurchaseLedgerWarning,
} from "@/lib/types/purchase-ledger.type"

type PurchaseLedgerSourceCellProps = {
  productionOrder: PurchaseLedgerProductionOrderRef | null
  note: string | null
}

// "PO liên quan / Lý do" shows exactly one of the two, never both — the backend DTO's own
// comment: `note` "hiển thị khi đề xuất không gắn LSX (productionOrder null)". A linked LSX whose
// code isn't assigned yet (not APPROVED) shows a dash rather than falling back to `note`, same as
// PurchaseRequestSourceCell (purchase-requests feature).
export function PurchaseLedgerSourceCell({
  productionOrder,
  note,
}: PurchaseLedgerSourceCellProps) {
  if (productionOrder) {
    return productionOrder.code ? (
      <span className="font-mono text-xs font-semibold text-primary">
        {productionOrder.code}
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">—</span>
    )
  }

  return <span className="text-xs text-muted-foreground">{note ?? "—"}</span>
}

type QuantityCellTone = "neutral" | "primary" | "ordered" | "received"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// "ordered" tone reads the value itself, not a fixed class — SL đặt mua = 0 is the same signal
// PurchaseLedgerWarning.NO_PO is derived from, so it gets flagged red at a glance even before
// the warning column is read. "received" tone highlights partial receipts in amber and complete in green.
function resolveQuantityToneClassName(
  tone: QuantityCellTone,
  value: number,
  comparisonTarget?: number
): string {
  switch (tone) {
    case "primary":
      return "text-primary"
    case "ordered":
      return value > 0 ? "text-success" : "text-destructive"
    case "received": {
      if (value === 0) return "text-muted-foreground"
      if (
        comparisonTarget !== undefined &&
        comparisonTarget > 0 &&
        value < comparisonTarget
      ) {
        return "text-amber-600 dark:text-amber-400"
      }
      return "text-success"
    }
    case "neutral":
      return "text-foreground"
  }
}

type PurchaseLedgerQuantityCellProps = {
  value: number
  tone: QuantityCellTone
  comparisonTarget?: number
}

export function PurchaseLedgerQuantityCell({
  value,
  tone,
  comparisonTarget,
}: PurchaseLedgerQuantityCellProps) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        resolveQuantityToneClassName(tone, value, comparisonTarget)
      )}
    >
      {quantityFormatter.format(value)}
    </span>
  )
}

type PurchaseLedgerWarningCellProps = {
  warnings: PurchaseLedgerWarning[]
}

export function PurchaseLedgerWarningCell({
  warnings,
}: PurchaseLedgerWarningCellProps) {
  if (warnings.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {warnings.map((warning) => (
        <PurchaseLedgerWarningBadge key={warning} warning={warning} />
      ))}
    </div>
  )
}

// No route/API for a detail screen yet — disabled, not linked.
export function PurchaseLedgerActionsCell() {
  return (
    <div className="flex items-center justify-center">
      <DisabledAction label="Xem chi tiết">
        <Eye className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
