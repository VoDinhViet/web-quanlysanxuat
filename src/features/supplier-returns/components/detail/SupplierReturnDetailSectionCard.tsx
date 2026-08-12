import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SupplierReturnDetailSectionCardProps = {
  icon: LucideIcon
  title: string
  className?: string
  contentClassName?: string
  children: ReactNode
}

// Shared shell for every content card on this detail page — icon + title, same idiom as
// OrderDetailSectionCard.tsx, but feature-local (this feature's own icons come from
// lucide-react, not @solar-icons/react) and without that card's isMock/action slots, which
// nothing here needs.
export function SupplierReturnDetailSectionCard({
  icon: Icon,
  title,
  className,
  contentClassName,
  children,
}: SupplierReturnDetailSectionCardProps) {
  return (
    <section
      className={cn(
        "h-fit overflow-hidden rounded-lg bg-card shadow-card",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </div>
      <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
    </section>
  )
}
