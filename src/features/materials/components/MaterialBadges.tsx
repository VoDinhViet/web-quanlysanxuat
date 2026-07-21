import { Factory, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_TYPE_LABELS,
  MaterialStatus,
  MaterialType,
} from "@/features/materials/types/material.type"
import { cn } from "@/lib/utils"

type TypeBadgeStyle = {
  className: string
  icon: LucideIcon
}

const TYPE_STYLE: Record<MaterialType, TypeBadgeStyle> = {
  [MaterialType.INTERNAL]: {
    className:
      "bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20",
    icon: Factory,
  },
  [MaterialType.CLIENT]: {
    className:
      "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20",
    icon: UserRound,
  },
}

export function MaterialTypeBadge({
  type,
  className,
}: {
  type: MaterialType
  className?: string
}) {
  const { className: styleClassName, icon: Icon } = TYPE_STYLE[type]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset",
        styleClassName,
        className
      )}
    >
      <Icon className="size-3" />
      {MATERIAL_TYPE_LABELS[type]}
    </span>
  )
}

type StatusBadgeStyle = {
  className: string
  dot: string
}

const STATUS_STYLE: Record<MaterialStatus, StatusBadgeStyle> = {
  [MaterialStatus.ACTIVE]: {
    className: "bg-success/10 text-success ring-success/20",
    dot: "bg-success",
  },
  [MaterialStatus.INACTIVE]: {
    className: "bg-muted text-muted-foreground ring-border",
    dot: "bg-muted-foreground/50",
  },
}

export function MaterialStatusBadge({
  status,
  className,
}: {
  status: MaterialStatus
  className?: string
}) {
  const { className: styleClassName, dot } = STATUS_STYLE[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset",
        styleClassName,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {MATERIAL_STATUS_LABELS[status]}
    </span>
  )
}
