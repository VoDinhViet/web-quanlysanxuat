import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/utils"

type IqcDetailSectionCardProps = {
  icon: ComponentType<IconProps>
  title: string
  // One-line context under the title, same "title + explanatory subtitle" idiom as
  // CreateOrderInfoSection/CreateSupplierOtherSection's own section headers — gives a bare
  // icon+title bar real substance instead of floating alone in a strip of white space.
  description?: string
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

// Shared shell for every card on this detail page below the header — icon chip + title (+
// optional description/trailing action), same idiom as SupplierReturnDetailSectionCard.tsx/
// PurchaseOrderStatusLegend's bespoke header, but feature-local per this repo's own convention
// (this feature's icons come from @solar-icons/react, matching IqcStatCards, not lucide-react).
// Every card on the page uses it — THÔNG TIN CHUNG, THÔNG TIN KIỂM TRA (AQL), KẾT QUẢ KIỂM TRA,
// 2 thẻ bằng chứng, QUYẾT ĐỊNH XỬ LÝ, LUỒNG XỬ LÝ, TRẠNG THÁI IQC, QUY TẮC QUAN TRỌNG.
export function IqcDetailSectionCard({
  icon: Icon,
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: IqcDetailSectionCardProps) {
  return (
    <section
      className={cn(
        "h-fit overflow-hidden rounded-lg bg-card shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
    </section>
  )
}
