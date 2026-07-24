import { cva } from "class-variance-authority"
import { Factory, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_TYPE_LABELS,
  MaterialStatus,
  MaterialType,
} from "@/features/materials/types/material.type"
import { cn } from "@/lib/utils"

const typeBadgeVariants = cva("", {
  variants: {
    type: {
      [MaterialType.INTERNAL]:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
      [MaterialType.CLIENT]:
        "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    },
  },
})

// The icon isn't badge styling, so it stays a plain map rather than being
// folded into the cva above.
const TYPE_ICON: Record<MaterialType, LucideIcon> = {
  [MaterialType.INTERNAL]: Factory,
  [MaterialType.CLIENT]: UserRound,
}

type MaterialTypeBadgeProps = {
  type: MaterialType
  className?: string
}

export function MaterialTypeBadge({ type, className }: MaterialTypeBadgeProps) {
  const Icon = TYPE_ICON[type]

  return (
    <Badge
      variant="outline"
      className={cn(typeBadgeVariants({ type }), className)}
    >
      <Icon className="size-3" />
      {MATERIAL_TYPE_LABELS[type]}
    </Badge>
  )
}

const statusBadgeVariants = cva("", {
  variants: {
    status: {
      [MaterialStatus.ACTIVE]: "bg-success/10 text-success",
      [MaterialStatus.INACTIVE]: "bg-muted text-muted-foreground",
    },
  },
})

// The dot tints a child element rather than the badge itself — see TYPE_ICON.
const STATUS_DOT_CLASSNAME: Record<MaterialStatus, string> = {
  [MaterialStatus.ACTIVE]: "bg-success",
  [MaterialStatus.INACTIVE]: "bg-muted-foreground/50",
}

type MaterialStatusBadgeProps = {
  status: MaterialStatus
  className?: string
}

export function MaterialStatusBadge({
  status,
  className,
}: MaterialStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ status }), className)}
    >
      <span
        className={cn("size-1.5 rounded-full", STATUS_DOT_CLASSNAME[status])}
      />
      {MATERIAL_STATUS_LABELS[status]}
    </Badge>
  )
}
