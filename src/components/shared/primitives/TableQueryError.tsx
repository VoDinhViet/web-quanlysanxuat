import { Button } from "@/components/ui/button"

type TableQueryErrorProps = {
  error: string
  onRetry?: () => void
}

// Centered placeholder for a list page's table region when its client-driven
// useQuery has failed — the filter bar above stays mounted and interactive,
// only this region swaps in. The pending state uses TableQueryLoading
// instead, which is sized to the loaded table's height.
export function TableQueryError({ error, onRetry }: TableQueryErrorProps) {
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
