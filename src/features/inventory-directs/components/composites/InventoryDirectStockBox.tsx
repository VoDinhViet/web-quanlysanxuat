import type { DirectInventoryItem } from "@/lib/types/inventory-direct.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type InventoryDirectStockBoxProps = {
  item: DirectInventoryItem
}

// Tổng quan tồn: ba dòng "nhãn — số", đứng sau đường kẻ dọc ngăn với vùng thông tin vật tư. Có thể xuất = Tồn thực tế − Đã giữ, đúng công thức cột
// "Có thể xuất" của danh sách; nhu cầu BOM không trừ vào đây vì hộp thoại chỉ giải thích số Đã giữ.
export function InventoryDirectStockBox({
  item,
}: InventoryDirectStockBoxProps) {
  const exportable = item.onHand - item.reserved

  const stockRows = [
    { label: "Tồn thực tế", value: item.onHand, emphasis: false },
    { label: "Đã giữ", value: item.reserved, emphasis: true },
    { label: "Có thể xuất", value: exportable, emphasis: false },
  ]

  return (
    <dl className="flex flex-col justify-center gap-3 self-stretch border-t border-border pt-4 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
      {stockRows.map((stockRow) => (
        <div
          key={stockRow.label}
          className="flex items-center justify-between gap-2"
        >
          <dt
            className={cn(
              "text-muted-foreground",
              stockRow.emphasis && "font-semibold text-foreground"
            )}
          >
            {stockRow.label}
          </dt>
          <dd
            className={cn(
              "font-medium text-foreground tabular-nums",
              stockRow.emphasis && "font-semibold text-info-ink",
              stockRow.value < 0 && "text-destructive"
            )}
          >
            {quantityFormatter.format(stockRow.value)} {item.unit.name}
          </dd>
        </div>
      ))}
    </dl>
  )
}
