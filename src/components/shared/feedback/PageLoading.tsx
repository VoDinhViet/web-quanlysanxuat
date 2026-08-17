import { Spinner } from "@/components/ui/spinner"

// Route-level pendingComponent — keeps the header strip in place (same
// min-h-22/bg-card/shadow-card as PageTitleBar) so only the content area
// blanks out while a route's loader is in flight, instead of the whole page
// (including the header) disappearing behind the router's full-viewport
// defaultPendingComponent. Deliberately has no props: a per-route skeleton
// is a later upgrade, swapped in one route at a time.
export function PageLoading() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="min-h-22 w-full bg-card shadow-card" />

      <div className="flex min-h-[calc(100svh-5.5rem)] w-full items-center justify-center p-4 sm:p-5 lg:p-6">
        <Spinner className="size-8" />
      </div>
    </main>
  )
}
