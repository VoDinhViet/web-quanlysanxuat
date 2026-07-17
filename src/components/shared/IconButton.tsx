import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

export function IconButton({
  label,
  asChild,
  children,
}: {
  label: string
  asChild?: boolean
  children: ReactNode
}) {
  return (
    <Button
      type={asChild ? undefined : "button"}
      variant="outline"
      size="icon-sm"
      aria-label={label}
      title={label}
      asChild={asChild}
    >
      {children}
    </Button>
  )
}
