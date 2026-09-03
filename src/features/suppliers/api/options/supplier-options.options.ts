import { queryOptions } from "@tanstack/react-query"

import { getSuppliers } from "@/features/suppliers/api/server-functions/get-suppliers.api"

// `getSuppliers` (above) is shared with the suppliers list page, where a
// failed fetch must throw so the errorComponent kicks in — but this dropdown
// is non-core and, per the original design here, a materials-only role may
// lack `suppliers:read`. This query is read straight from a route loader
// (materials list/create/update) via `query({ ...options, staleTime: "static" })`,
// which doesn't catch — so degrading to `[]` has to happen in the queryFn
// itself, or a missing permission would crash the whole page instead of just
// leaving this picker empty.
export const supplierOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["suppliers", "options"],
    queryFn: () =>
      getSuppliers({ data: { limit: 100 } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: 5 * 60_000,
  })
