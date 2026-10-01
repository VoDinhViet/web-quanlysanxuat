import { Eye } from "lucide-react"
import {
  ArchiveDownMinimalistic,
  BoxMinimalistic,
  CartLargeMinimalistic,
} from "@solar-icons/react"

import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { PurchaseLedgerWarningBadge } from "@/features/purchase-ledger/components/primitives/PurchaseLedgerBadges"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import {
  PurchaseLedgerWarning,
  type PurchaseLedgerProductionOrderRef,
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

type PurchaseLedgerProgressCellProps = {
  quantity: number
  orderedQuantity: number
  receivedQuantity: number
  unitName: string
}

export function PurchaseLedgerProgressCell({
  quantity,
  orderedQuantity,
  receivedQuantity,
  unitName,
}: PurchaseLedgerProgressCellProps) {
  const orderedPct =
    quantity > 0 ? Math.min(100, Math.round((orderedQuantity / quantity) * 100)) : 0
  const receivedPct =
    quantity > 0 ? Math.min(100, Math.round((receivedQuantity / quantity) * 100)) : 0

  const isCompleted = receivedQuantity >= quantity && quantity > 0
  const isOrdered = orderedQuantity >= quantity && quantity > 0

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={80}
        closeDelay={120}
        render={
          <div className="group flex flex-col gap-0.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted/70 cursor-default">
            {/* Dòng 1: Số lượng cần mua */}
            <div className="flex items-baseline gap-1 text-xs">
              <span className="font-semibold tabular-nums text-foreground group-hover:text-primary transition-colors">
                {quantityFormatter.format(quantity)}
              </span>
              <span className="text-[11px] font-normal text-muted-foreground">
                {unitName}
              </span>
            </div>

            {/* Dòng 2: Thực tế Đặt / Nhập */}
            <div className="flex items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
              <span>
                Đặt:{" "}
                <span
                  className={cn(
                    "font-medium",
                    isOrdered
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : orderedQuantity > 0
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                  )}
                >
                  {quantityFormatter.format(orderedQuantity)}
                </span>
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span>
                Nhập:{" "}
                <span
                  className={cn(
                    "font-medium",
                    isCompleted
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : receivedQuantity > 0
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                  )}
                >
                  {quantityFormatter.format(receivedQuantity)}
                </span>
              </span>
            </div>
          </div>
        }
      />
      <HoverCardContent
        align="start"
        className="w-72 border border-border/70 bg-popover p-3.5 shadow-lg rounded-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div className="flex items-center gap-1.5">
            <CartLargeMinimalistic className="size-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Tiến độ mua hàng
            </span>
          </div>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ĐVT: {unitName}
          </span>
        </div>

        {/* Danh sách thông số */}
        <dl className="space-y-2 pt-2.5 text-xs">
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <BoxMinimalistic className="size-3.5 text-muted-foreground/70" />
              <span>SL cần mua</span>
            </dt>
            <dd className="font-semibold text-foreground tabular-nums">
              {quantityFormatter.format(quantity)} {unitName}
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <CartLargeMinimalistic className="size-3.5 text-blue-500" />
              <span>Đã đặt hàng (PO)</span>
            </dt>
            <dd className="flex items-center gap-1.5 tabular-nums">
              <span
                className={cn(
                  "font-medium",
                  orderedQuantity > 0 ? "text-foreground" : "text-muted-foreground/60"
                )}
              >
                {quantityFormatter.format(orderedQuantity)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                ({orderedPct}%)
              </span>
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <ArchiveDownMinimalistic
                className={cn(
                  "size-3.5",
                  isCompleted ? "text-emerald-500" : "text-muted-foreground/70"
                )}
              />
              <span>Đã nhập kho</span>
            </dt>
            <dd className="flex items-center gap-1.5 tabular-nums">
              <span
                className={cn(
                  "font-medium",
                  isCompleted
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : receivedQuantity > 0
                      ? "text-foreground"
                      : "text-muted-foreground/60"
                )}
              >
                {quantityFormatter.format(receivedQuantity)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                ({receivedPct}%)
              </span>
            </dd>
          </div>
        </dl>

        {/* Thanh tiến độ hoàn thành tinh tế */}
        <div className="mt-3 pt-2.5 border-t border-border/50">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Tiến độ nhập kho</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                isCompleted
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              )}
            >
              {receivedPct}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isCompleted ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${receivedPct}%` }}
            />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

type PurchaseLedgerWarningCellProps = {
  warnings: PurchaseLedgerWarning[]
}

export function PurchaseLedgerWarningCell({
  warnings,
}: PurchaseLedgerWarningCellProps) {
  if (warnings.length === 0) {
    return <span className="font-mono text-xs text-muted-foreground/40">—</span>
  }

  const sortedWarnings = [...warnings].sort((a, b) => {
    if (a === PurchaseLedgerWarning.URGENT) return -1
    if (b === PurchaseLedgerWarning.URGENT) return 1
    return 0
  })

  return (
    <div className="flex flex-row items-center gap-1.5 flex-nowrap">
      {sortedWarnings.map((warning) => (
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
