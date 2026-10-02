import { Cart, CheckCircle, Wallet } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { vndFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"

type PurchaseOrderCloseOutcomesProps = {
  closedAmount: number
  shortCount: number
}

// What happens after "Đóng sớm PO", as a short ordered flow: PO done → payment request → leftover
// re-purchase (the only step that stays manual).
export function PurchaseOrderCloseOutcomes({
  closedAmount,
  shortCount,
}: PurchaseOrderCloseOutcomesProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-muted/40 p-3">
      <p className="text-xs font-semibold text-foreground">Sau khi đóng</p>
      <ol className="flex flex-col gap-2">
        <Outcome icon={CheckCircle} toneClassName="bg-success/10 text-success">
          Đơn chuyển sang <strong>"Hoàn tất"</strong> (đánh dấu Đóng sớm).
        </Outcome>
        <Outcome icon={Wallet} toneClassName="bg-info/10 text-info">
          Tạo yêu cầu thanh toán{" "}
          <strong>{vndFormatter.format(closedAmount)} VND</strong> theo số đã
          nhập.
        </Outcome>
        <Outcome icon={Cart} toneClassName="bg-warning/15 text-warning">
          Phần thiếu ({shortCount} dòng) cần mua riêng bằng báo giá mới nếu vẫn
          còn nhu cầu.
        </Outcome>
      </ol>
    </div>
  )
}

type OutcomeProps = {
  icon: ComponentType<IconProps>
  toneClassName: string
  children: ReactNode
}

function Outcome({ icon: Icon, toneClassName, children }: OutcomeProps) {
  return (
    <li className="flex items-start gap-2.5 text-xs leading-normal text-muted-foreground">
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full",
          toneClassName
        )}
      >
        <Icon weight="Bold" className="size-3.5" />
      </span>
      <span className="pt-1">{children}</span>
    </li>
  )
}
