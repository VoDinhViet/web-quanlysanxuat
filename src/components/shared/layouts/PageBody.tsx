import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageBodyProps = {
  className?: string
  children: ReactNode
}

// The padded content wrapper below PageShell's header — same on every list/create/detail page.
// `flex flex-col gap-4` is a no-op when there's only one child (the create page's form), so one
// shape covers both single- and multi-section bodies without changing how either renders.
export function PageBody({ className, children }: PageBodyProps) {
  return (
    <div
      className={cn("flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6", className)}
    >
      {children}
    </div>
  )
}
