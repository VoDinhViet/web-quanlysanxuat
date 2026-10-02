import { Bill, DangerTriangle, WalletMoney } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { vndFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"

type SummaryTone = "info" | "success" | "warning"

const toneStyles: Record<SummaryTone, string> = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
}

type PurchaseOrderCloseSummaryProps = {
  originalAmount: number
  closedAmount: number
  shortCount: number
}

export function PurchaseOrderCloseSummary({
  originalAmount,
  closedAmount,
  shortCount,
}: PurchaseOrderCloseSummaryProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <SummaryTile
        icon={Bill}
        tone="info"
        label="Đặt ban đầu"
        value={`${vndFormatter.format(originalAmount)} VND`}
      />
      <SummaryTile
        icon={WalletMoney}
        tone="success"
        label="Chốt theo đã nhập"
        value={`${vndFormatter.format(closedAmount)} VND`}
      />
      <SummaryTile
        icon={DangerTriangle}
        tone="warning"
        label="Phần thiếu"
        value={`${shortCount} dòng`}
      />
    </div>
  )
}

type SummaryTileProps = {
  icon: ComponentType<IconProps>
  tone: SummaryTone
  label: string
  value: string
}

function SummaryTile({ icon: Icon, tone, label, value }: SummaryTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          toneStyles[tone]
        )}
      >
        <Icon weight="Bold" className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-semibold tabular-nums">
          {value}
        </span>
      </span>
    </div>
  )
}
