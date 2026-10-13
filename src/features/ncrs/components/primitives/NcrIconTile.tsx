import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { cn } from "@/lib/utils"

export type NcrTone =
  | "primary"
  | "neutral"
  | "info"
  | "warning"
  | "success"
  | "destructive"

const toneClasses: Record<NcrTone, string> = {
  primary: "bg-primary/10 text-primary",
  neutral: "bg-neutral-soft text-neutral-ink",
  info: "bg-info-soft text-info-ink",
  warning: "bg-warning-soft text-warning-ink",
  success: "bg-success-soft text-success-ink",
  destructive: "bg-destructive-soft text-destructive-ink",
}

type NcrIconTileProps = {
  icon: ComponentType<IconProps>
  tone?: NcrTone
  className?: string
}

// Rounded tinted square holding one icon — the visual anchor shared by the NCR section cards,
// summary cards, info items and timeline so the page reads as one system.
export function NcrIconTile({
  icon: Icon,
  tone = "primary",
  className,
}: NcrIconTileProps) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md",
        toneClasses[tone],
        className
      )}
    >
      <Icon weight="Bold" className="size-4" aria-hidden />
    </span>
  )
}
