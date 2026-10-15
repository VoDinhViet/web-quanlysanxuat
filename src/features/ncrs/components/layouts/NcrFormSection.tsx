import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { NcrIconTile } from "@/features/ncrs/components/primitives/NcrIconTile"
import type { NcrTone } from "@/features/ncrs/components/primitives/NcrIconTile"

type NcrFormSectionProps = {
  icon: ComponentType<IconProps>
  tone: NcrTone
  title: string
  description: string
  aside?: ReactNode
  children: ReactNode
}

// One titled block inside a section card's form — consecutive blocks are split by a hairline.
export function NcrFormSection({
  icon,
  tone,
  title,
  description,
  aside,
  children,
}: NcrFormSectionProps) {
  return (
    <section className="space-y-4 py-5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <NcrIconTile icon={icon} tone={tone} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-foreground/70">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}
