import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/ui/button"

type IconButtonProps = {
  label: string
  asChild?: boolean
  size?: ComponentProps<typeof Button>["size"]
  className?: string
  children: ReactNode
} & Omit<ComponentProps<"button">, "className" | "children">

export function IconButton({
  label,
  asChild,
  size = "icon-sm",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    // Rest props are forwarded (after the `type` default so a passed type wins)
    // so Radix triggers (`SheetTrigger asChild`, `AlertDialogTrigger asChild`)
    // can attach their onClick/aria props — dropping them leaves the trigger
    // rendered but inert.
    <Button
      type={asChild ? undefined : "button"}
      {...props}
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
