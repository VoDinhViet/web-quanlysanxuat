import type { ReactNode } from "react"

type GallerySectionProps = {
  id: string
  title: string
  description?: string
  children: ReactNode
}

export function GallerySection({
  id,
  title,
  description,
  children,
}: GallerySectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-20 overflow-hidden rounded-lg bg-card shadow-card"
    >
      <div className="border-b border-border px-4 py-3.5 sm:px-5">
        <h2 className="font-heading text-sm font-medium text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-6 p-4 sm:p-5">{children}</div>
    </section>
  )
}

type GalleryRowProps = {
  label: string
  children: ReactNode
}

export function GalleryRow({ label, children }: GalleryRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}
