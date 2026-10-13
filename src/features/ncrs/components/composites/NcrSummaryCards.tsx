import type { NcrDetail } from "@/lib/types/ncr.type"
import { cn } from "@/lib/utils"

type NcrSummaryCardsProps = {
  ncr: NcrDetail
}

type SummaryStat = {
  label: string
  value: string
  caption: string
  valueClassName?: string
}

const numberFormatter = new Intl.NumberFormat("vi-VN")

function buildSummaryStats(ncr: NcrDetail): SummaryStat[] {
  const recordOnlyQty = Math.max(0, ncr.ngQty - ncr.reworkQty - ncr.remakeQty)

  return [
    {
      label: "SL hàng lỗi",
      value: numberFormatter.format(ncr.ngQty),
      caption: "Tổng số lượng NG",
      valueClassName: "text-destructive",
    },
    {
      label: "Sửa chữa",
      value: numberFormatter.format(ncr.reworkQty),
      caption: "Giữ hàng, sửa lại công đoạn đã chọn",
      valueClassName: "text-warning-ink",
    },
    {
      label: "Làm mới",
      value: numberFormatter.format(ncr.remakeQty),
      caption: "Huỷ hàng lỗi, sản xuất lại đủ routing",
      valueClassName: "text-info-ink",
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
      valueClassName: "text-success-ink",
    },
  ]
}

// Stat row rendered inside the header surface: dividers only, no shell of its own.
export function NcrSummaryCards({ ncr }: NcrSummaryCardsProps) {
  return (
    <dl className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-3 xl:grid-cols-5">
      {buildSummaryStats(ncr).map((stat) => (
        <div key={stat.label} className="space-y-1 bg-card px-4 py-4 sm:px-5">
          <dt className="text-xs font-medium text-muted-foreground">
            {stat.label}
          </dt>
          <dd
            className={cn(
              "text-xl font-medium text-foreground tabular-nums",
              stat.valueClassName
            )}
          >
            {stat.value}
          </dd>
          <p className="text-xs leading-snug text-muted-foreground">
            {stat.caption}
          </p>
        </div>
      ))}
    </dl>
  )
}
