import type { ReactNode } from "react"

type NcrSectionCardProps = {
  title: string
  description?: string
  children: ReactNode
}

export function NcrSectionCard({
  title,
  description,
  children,
}: NcrSectionCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="border-b border-border px-4 py-3.5 sm:px-5">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
