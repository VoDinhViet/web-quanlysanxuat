import { vndFormatter } from "@/lib/currency"
import type { OrderDetail, OrderItem } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

const countFormatter = new Intl.NumberFormat("vi-VN")
// `issuedPercent` is already computed on a 0–100 scale (see below) — plain number format +
// "%", not Intl's `style: "percent"` (which expects a 0–1 fraction), same idiom as
// order-stat-tiles.ts's percentFormatter.
const percentFormatter = new Intl.NumberFormat("vi-VN")

type StatTile = {
  label: string
  value: string
  subtitle: string | null
  toneClassName: string
}

type OrderDetailStatTilesProps = {
  order: OrderDetail
  items: OrderItem[]
}

// A single row of 4 flat tinted boxes beside the meta grid in
// OrderDetailSummaryCard. "Đã giao"/"Còn lại" derive from each line's real
// `issuedQty` (see OrderItem in order.type.ts) — the delivered share of
// order.subtotal (goods only, pre-VAT/shipping) is applied to order.totalVnd
// so the 2 value tiles still sum to "Tổng giá trị" exactly.
export function OrderDetailStatTiles({
  order,
  items,
}: OrderDetailStatTilesProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  const issuedSubtotal = items.reduce(
    (sum, item) =>
      sum + item.issuedQty * item.unitPrice * (1 - item.discountPercent / 100),
    0
  )
  const issuedPercent =
    order.subtotal > 0 ? Math.round((issuedSubtotal / order.subtotal) * 100) : 0
  const issuedVnd = (order.totalVnd * issuedPercent) / 100
  const remainingVnd = order.totalVnd - issuedVnd

  const tiles: StatTile[] = [
    {
      label: "Tổng giá trị",
      value: `${vndFormatter.format(order.totalVnd)} VND`,
      subtitle: null,
      toneClassName: "bg-muted/50 text-foreground",
    },
    {
      label: "Đã giao",
      value: `${vndFormatter.format(issuedVnd)} VND`,
      subtitle: `${percentFormatter.format(issuedPercent)}%`,
      toneClassName: "bg-success/10 text-success",
    },
    {
      label: "Còn lại",
      value: `${vndFormatter.format(remainingVnd)} VND`,
      subtitle: `${percentFormatter.format(100 - issuedPercent)}%`,
      toneClassName:
        remainingVnd < 0
          ? "bg-destructive/10 text-destructive"
          : "bg-warning/10 text-warning",
    },
    {
      label: "Số lượng",
      value: `${countFormatter.format(totalQuantity)} SP`,
      subtitle: null,
      toneClassName: "bg-muted/50 text-foreground",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cn("rounded-lg p-3", tile.toneClassName)}
        >
          <p className="truncate text-[10px] font-semibold tracking-wide uppercase opacity-80">
            {tile.label}
          </p>
          <p className="mt-1 truncate text-lg font-bold">{tile.value}</p>
          {tile.subtitle ? (
            <p className="text-[11px] opacity-70">{tile.subtitle}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
