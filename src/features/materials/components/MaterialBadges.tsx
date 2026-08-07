import { Factory, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_TYPE_LABELS,
  MaterialStatus,
  MaterialType,
} from "@/lib/types/material.type"
import { cn } from "@/lib/utils"

const typeStyles: Record<MaterialType, string> = {
  [MaterialType.INTERNAL]:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  [MaterialType.CLIENT]:
    "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
}

// The icon isn't badge styling, so it stays a plain map rather than being
// folded into the style map above.
const typeIcon: Record<MaterialType, LucideIcon> = {
  [MaterialType.INTERNAL]: Factory,
  [MaterialType.CLIENT]: UserRound,
}

type MaterialTypeBadgeProps = {
  type: MaterialType
  className?: string
}

export function MaterialTypeBadge({ type, className }: MaterialTypeBadgeProps) {
  const Icon = typeIcon[type]

  return (
    <Badge variant="outline" className={cn(typeStyles[type], className)}>
      <Icon className="size-3" />
      {MATERIAL_TYPE_LABELS[type]}
    </Badge>
  )
}

type StatusBadgeStyle = {
  badge: string
  dot: string
}

const statusStyles: Record<MaterialStatus, StatusBadgeStyle> = {
  [MaterialStatus.ACTIVE]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [MaterialStatus.INACTIVE]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
}

type MaterialStatusBadgeProps = {
  status: MaterialStatus
  className?: string
}

export function MaterialStatusBadge({
  status,
  className,
}: MaterialStatusBadgeProps) {
  const { badge, dot } = statusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {MATERIAL_STATUS_LABELS[status]}
    </Badge>
  )
}
