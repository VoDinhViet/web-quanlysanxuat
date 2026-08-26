import { PagePending } from "@/components/shared/feedback/PagePending"

// Route-level pendingComponent for a route that hasn't split into its own
// layout + data-owning child route — keeps the header strip in place (same
// min-h-22/bg-card/shadow-card as PageTitleBar) so only the content area
// blanks out while the loader is in flight, instead of the whole page
// (including the header) disappearing behind the router's full-viewport
// defaultPendingComponent. A route that has split uses PagePending directly
// instead — see production-jobs' route.tsx for the pilot.
export function LayoutPagePending() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="min-h-22 w-full bg-card shadow-card" />

      <PagePending />
    </main>
  )
}
