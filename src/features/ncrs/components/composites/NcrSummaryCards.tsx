import type { NcrDetail } from "@/lib/types/ncr.type"
import { cn } from "@/lib/utils"

type NcrSummaryCardsProps = {
  ncr: NcrDetail
}

type SummaryCard = {
  label: string
  value: string
  caption: string
  valueClassName?: string
}

const numberFormatter = new Intl.NumberFormat("vi-VN")

function buildSummaryCards(ncr: NcrDetail): SummaryCard[] {
  const recordOnlyQty = Math.max(0, ncr.ngQty - ncr.reworkQty - ncr.remakeQty)

  return [
    {
      label: "SL hàng lỗi",
      value: numberFormatter.format(ncr.ngQty),
      caption: "Tổng số lượng không phù hợp",
      valueClassName: "text-destructive",
    },
    {
      label: "Sửa chữa",
      value: numberFormatter.format(ncr.reworkQty),
      caption: "Giữ hàng, sửa lại công đoạn đã chọn",
      valueClassName: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Làm mới",
      value: numberFormatter.format(ncr.remakeQty),
      caption: "Huỷ hàng lỗi, sản xuất lại đủ routing",
      valueClassName: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Chỉ ghi nhận",
      value: numberFormatter.format(recordOnlyQty),
      caption: "Không xử lý, lưu để theo dõi",
    },
    {
      label: "Dự toán chi phí",
      value: `${numberFormatter.format(ncr.totalCost)} đ`,
      caption: `${ncr.costLines.length} dòng chi phí`,
    },
  ]
}

export function NcrSummaryCards({ ncr }: NcrSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {buildSummaryCards(ncr).map((card) => (
        <div key={card.label} className="rounded-lg bg-card p-4 shadow-card">
          <p className="text-[11px] font-medium text-muted-foreground uppercase">
            {card.label}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold text-foreground tabular-nums",
              card.valueClassName
            )}
          >
            {card.value}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            {card.caption}
          </p>
        </div>
      ))}
    </div>
  )
}
