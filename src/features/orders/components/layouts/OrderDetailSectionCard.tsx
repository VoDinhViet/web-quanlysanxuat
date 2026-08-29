import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { MockDataBadge } from "@/components/shared/primitives/MockDataBadge"
import { cn } from "@/lib/utils"

type OrderDetailSectionCardProps = {
  icon: ComponentType<IconProps>
  title: string
  isMock?: boolean
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

// Shared shell for every content card on the order detail page — icon +
// title, an optional "Dữ liệu mẫu" flag for the 4 sections built on
// order-detail-mock.ts, and an optional right-aligned action slot. A plain
// <section> (same shell as ProductDetailPage's own top section) rather than
// the shadcn Card component — see OrderDetailSummaryCard for the same idiom.
export function OrderDetailSectionCard({
  icon: IconComponent,
  title,
  isMock,
  action,
  className,
  contentClassName,
  children,
}: OrderDetailSectionCardProps) {
  return (
    <section
      className={cn(
        "h-fit overflow-hidden rounded-lg bg-card shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight text-foreground">
          <IconComponent className="size-4 text-muted-foreground" />
          {title}
        </div>
        {isMock || action ? (
          <div className="flex items-center gap-2">
            {isMock ? <MockDataBadge /> : null}
            {action}
          </div>
        ) : null}
      </div>
      <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
    </section>
  )
}
