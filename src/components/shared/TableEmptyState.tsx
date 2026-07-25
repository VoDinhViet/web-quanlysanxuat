import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

type TableEmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

// Shared "no rows" block for every list table — built on shadcn's Empty
// primitive so every table's empty state shares one visual shape.
export function TableEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: TableEmptyStateProps) {
  return (
    <Empty className={cn("border border-border/70 bg-card", className)}>
      <EmptyHeader className="max-w-lg">
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle className="capitalize">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
