import type { ReactNode } from "react"

import type { PageTitleBreadcrumb } from "@/components/shared/layouts/PageTitleBar"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"

type PageShellProps = {
  title: string
  // Trailing crumbs only — PageShell prepends "Bảng điều khiển" itself, since every call site
  // repeated that first breadcrumb verbatim.
  breadcrumbs: PageTitleBreadcrumb[]
  children: ReactNode
}

// The `<main>` + PageTitleBar pair every route/page renders at its top. A page-level layout
// route (see production-jobs/inventory-requisitions' route.tsx) owns this once for its whole
// list+detail+create group; a route without that split renders it itself in its page component.
export function PageShell({ title, breadcrumbs, children }: PageShellProps) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title={title}
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          ...breadcrumbs,
        ]}
      />

      {children}
    </main>
  )
}
