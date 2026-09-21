import type { UseQueryResult } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"

type TableQueryBoundaryProps<TData> = {
  query: UseQueryResult<TData, Error>
  loadingRows: number
  // Render-prop, not a plain node: `query.data` only narrows to non-undefined inside this
  // component's own isPending/isError checks, not in the caller's JSX construction — passing
  // it as a callback lets the caller receive an already-narrowed `data` instead of re-deriving
  // the narrowing itself.
  children: (data: TData) => ReactNode
}

// The isPending/isError/data 3-way branch every list page repeats verbatim above its table.
// See InventoryRequisitionsPage.tsx for a call site.
export function TableQueryBoundary<TData>({
  query,
  loadingRows,
  children,
}: TableQueryBoundaryProps<TData>) {
  if (query.isPending) {
    return <TableQueryLoading rows={loadingRows} />
  }

  if (query.isError) {
    return (
      <TableQueryError
        error={query.error.message}
        onRetry={() => void query.refetch()}
      />
    )
  }

  return <>{children(query.data)}</>
}
