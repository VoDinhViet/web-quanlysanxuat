import { Link } from "@tanstack/react-router"

import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import type { ProductLedgerEntry } from "@/lib/types/product-ledger.type"
import {
  productLedgerMovementTypeLabels,
  resolveProductLedgerMovementType,
} from "@/lib/types/product-ledger.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Một dòng thẻ kho luôn trỏ đúng 1 trong 2: phiếu nhập (có detail route) hoặc phiếu xuất
// (inventory-issues chưa có detail route, cùng idiom "không link" của PurchaseLedgerSourceCell).
export function InventoryProductLedgerReferenceCell({
  entry,
}: {
  entry: ProductLedgerEntry
}) {
  const codeClassName = "font-mono text-xs font-semibold text-primary"

  if (entry.inventoryReceipt) {
    return (
      <RoutePermissionGate
        route="/manage/inventory-receipts/$inventoryReceiptId"
        fallback={
          <span className={codeClassName}>{entry.inventoryReceipt.code}</span>
        }
      >
        <Link
          to="/manage/inventory-receipts/$inventoryReceiptId"
          params={{ inventoryReceiptId: entry.inventoryReceipt.id }}
          className={cn(codeClassName, "hover:underline")}
        >
          {entry.inventoryReceipt.code}
        </Link>
      </RoutePermissionGate>
    )
  }

  if (entry.inventoryIssue) {
    return <span className={codeClassName}>{entry.inventoryIssue.code}</span>
  }

  return <span className="text-xs text-muted-foreground">—</span>
}

// Backend không trả sẵn câu diễn giải — ghép từ loại giao dịch (suy ở FE) + Job/Đơn/DO liên quan
// + ghi chú của chứng từ, xem product-ledger.type.ts.
export function InventoryProductLedgerDescriptionCell({
  entry,
}: {
  entry: ProductLedgerEntry
}) {
  const movementType = resolveProductLedgerMovementType(entry)
  const refParts = [
    entry.productionJob ? `Job ${entry.productionJob.code}` : null,
    entry.order ? `Đơn ${entry.order.code}` : null,
    entry.outboundOrder ? `DO ${entry.outboundOrder.code}` : null,
    entry.note,
  ].filter((part): part is string => Boolean(part))

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-foreground">
        {productLedgerMovementTypeLabels[movementType]}
      </span>
      {refParts.length > 0 && (
        <span className="text-[11px] text-muted-foreground">
          {refParts.join(" · ")}
        </span>
      )}
    </div>
  )
}

type InventoryProductLedgerQuantityCellProps = {
  value: number
  tone: "in" | "out"
}

// `quantity` on the row is a single signed number — split into the Nhập/Xuất columns at the
// call site (InventoryProductLedgerColumns.tsx), each cell only renders when its own sign
// matches, "—" otherwise.
export function InventoryProductLedgerQuantityCell({
  value,
  tone,
}: InventoryProductLedgerQuantityCellProps) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        tone === "in" ? "text-success" : "text-destructive"
      )}
    >
      {quantityFormatter.format(Math.abs(value))}
    </span>
  )
}

export function InventoryProductLedgerBalanceCell({
  value,
}: {
  value: number
}) {
  return (
    <span className="font-semibold text-foreground tabular-nums">
      {quantityFormatter.format(value)}
    </span>
  )
}
