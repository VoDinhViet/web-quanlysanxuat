import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

type OqcDetailSectionCardProps = {
  icon: ComponentType<IconProps>
  title: string
  description?: string
  // Inline after the title (vd mã phiếu + badge) và slot hành động bên phải header.
  titleExtra?: ReactNode
  action?: ReactNode
  children: ReactNode
}

// Shared shell for every content card on this detail page — icon chip + title (+ optional
// subtitle), same idiom as SupplierReturnDetailSectionCard.tsx/IqcDetailSectionCard.tsx.
export function OqcDetailSectionCard({
  icon: Icon,
  title,
  description,
  titleExtra,
  action,
  children,
}: OqcDetailSectionCardProps) {
  return (
    <section className="h-fit overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="font-heading text-base font-medium text-foreground">
                {title}
              </h2>
              {titleExtra}
            </div>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
