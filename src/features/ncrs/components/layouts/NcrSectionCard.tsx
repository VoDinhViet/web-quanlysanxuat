import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { NcrIconTile } from "@/features/ncrs/components/primitives/NcrIconTile"
import type { NcrTone } from "@/features/ncrs/components/primitives/NcrIconTile"

type NcrSectionCardProps = {
  title: string
  description?: string
  icon?: ComponentType<IconProps>
  tone?: NcrTone
  action?: ReactNode
  children: ReactNode
}

export function NcrSectionCard({
  title,
  description,
  icon,
  tone,
  action,
  children,
}: NcrSectionCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-xs">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        {icon && <NcrIconTile icon={icon} tone={tone} />}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-sm font-medium text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
