import type { ComponentProps } from "react"

import { CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Shared dashboard card/table title — uppercase bold, kept identical across
 *  every widget so the whole page reads consistently. */
export function ManageCardTitle({
  className,
  ...props
}: ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      className={cn("text-xs font-bold tracking-wide uppercase", className)}
      {...props}
    />
  )
}
