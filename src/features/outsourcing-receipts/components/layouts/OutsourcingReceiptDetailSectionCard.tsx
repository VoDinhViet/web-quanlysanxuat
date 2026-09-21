import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type OutsourcingReceiptDetailSectionCardProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

// Shared shell for every content card on this detail page — icon chip + title (+ optional
// subtitle/action), same idiom as SupplierReturnDetailSectionCard.tsx.
export function OutsourcingReceiptDetailSectionCard({
  icon: Icon,
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: OutsourcingReceiptDetailSectionCardProps) {
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
