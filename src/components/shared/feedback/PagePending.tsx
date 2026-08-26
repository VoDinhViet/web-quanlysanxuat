import { Spinner } from "@/components/ui/spinner"

// The content-only spinner — a route's own pendingComponent when it's the
// data-owning child of a layout route that already renders a real header
// (e.g. production-jobs' route.tsx), standing in for just its <Outlet/>. A
// route that hasn't split into layout + child yet uses LayoutPagePending
// instead (composes this plus the header placeholder) — see
// LayoutPagePending.tsx.
export function PagePending() {
  return (
    <div className="flex min-h-[calc(100svh-5.5rem)] w-full items-center justify-center p-4 sm:p-5 lg:p-6">
      <Spinner className="size-8" />
    </div>
  )
}
