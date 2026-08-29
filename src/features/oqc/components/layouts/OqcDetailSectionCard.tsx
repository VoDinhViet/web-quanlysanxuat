import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

type OqcDetailSectionCardProps = {
  icon: ComponentType<IconProps>
  title: string
  description?: string
  children: ReactNode
}

// Shared shell for every content card on this detail page — icon chip + title (+ optional
// subtitle), same idiom as SupplierReturnDetailSectionCard.tsx/IqcDetailSectionCard.tsx.
export function OqcDetailSectionCard({
  icon: Icon,
  title,
  description,
  children,
}: OqcDetailSectionCardProps) {
  return (
    <section className="h-fit overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
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
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
