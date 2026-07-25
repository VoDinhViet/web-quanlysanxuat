import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type TableQueryFallbackProps = {
  status: "pending" | "error"
  error?: string
  onRetry?: () => void
}

// Centered placeholder for a list page's table region while its client-driven
// useQuery is pending or has failed — the filter bar above stays mounted and
// interactive, only this region swaps in.
export function TableQueryFallback({
  status,
  error,
  onRetry,
}: TableQueryFallbackProps) {
  if (status === "pending") {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
      <p className="max-w-md text-sm font-medium text-muted-foreground">
        {error}
      </p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  )
}
