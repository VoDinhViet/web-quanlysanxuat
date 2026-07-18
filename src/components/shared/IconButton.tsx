import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/ui/button"

export function IconButton({
  label,
  asChild,
  size = "icon-sm",
  className,
  children,
}: {
  label: string
  asChild?: boolean
  size?: ComponentProps<typeof Button>["size"]
  className?: string
  children: ReactNode
}) {
  return (
    <Button
      type={asChild ? undefined : "button"}
      variant="outline"
      size={size}
      aria-label={label}
      title={label}
      asChild={asChild}
      className={className}
    >
      {children}
    </Button>
  )
}
