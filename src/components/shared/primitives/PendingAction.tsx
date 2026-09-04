import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"

type PendingActionProps = {
  label: string
  hint: string
  children: ReactNode
  variant?: ComponentProps<typeof Button>["variant"]
}

// A filter-bar action button whose destination screen/feature doesn't exist
// yet. A <Link> to an unregistered route wouldn't typecheck and a raw <a>
// would 404, so it stays disabled and explains why via tooltip. The
// <span tabIndex={0}> wrapper is load-bearing: a disabled button swallows
// pointer events, so the tooltip would never fire without it.
export function PendingAction({
  label,
  hint,
  children,
  variant = "outline",
}: PendingActionProps) {
  return (
    <TooltipTrigger>
      <span tabIndex={0}>
        <Button
          type="button"
          variant={variant}
          className="pointer-events-none text-xs"
          aria-label={label}
          isDisabled
        >
          {children}
        </Button>
      </span>
      <Tooltip>{hint}</Tooltip>
    </TooltipTrigger>
  )
}
