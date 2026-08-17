import { Spinner } from "@/components/ui/spinner"

type TableQueryLoadingProps = {
  rows: number
}

// Centered spinner for a list page's table region while its client-driven
// useQuery is pending — sized to the real table's height (header h-12 + rows
// × h-14 + 2px border + pagination pt-4 + h-9) so swapping in the loaded
// table doesn't shift the page. Tailwind can't generate a class from a
// runtime value, hence the inline style.
export function TableQueryLoading({ rows }: TableQueryLoadingProps) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center justify-center px-4 pb-4 lg:px-5"
      style={{ minHeight: rows * 56 + 102 }}
    >
      <Spinner className="size-8" />
    </div>
  )
}
