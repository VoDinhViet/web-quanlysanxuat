import { queryOptions } from "@tanstack/react-query"

import { getSupplier } from "@/features/suppliers/api/server-functions/get-supplier.api"
import { getSupplierGroups } from "@/features/suppliers/api/server-functions/get-supplier-groups.api"
import { getSupplierStats } from "@/features/suppliers/api/server-functions/get-supplier-stats.api"
import { getSuppliers } from "@/features/suppliers/api/server-functions/get-suppliers.api"
import type { SuppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"
import { REFERENCE_STALE_TIME } from "@/lib/constants"

// Query key convention (see .claude/rules/architecture.md): `["suppliers"]` is
// the feature root, so `invalidateQueries({ queryKey: ["suppliers"] })` after a
// write refreshes list + stats + detail + the options dropdown in one call.
export const suppliersQueryOptions = (search: SuppliersSearchSchema) =>
  queryOptions({
    queryKey: ["suppliers", "list", search],
    queryFn: () => getSuppliers({ data: search }),
  })

export const supplierStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["suppliers", "stats"],
    queryFn: () => getSupplierStats(),
  })

export const supplierQueryOptions = (supplierId: string) =>
  queryOptions({
    queryKey: ["suppliers", "detail", supplierId],
    queryFn: () => getSupplier({ data: { supplierId } }),
  })

export const supplierGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["suppliers", "group-options"],
    queryFn: () => getSupplierGroups(),
    staleTime: REFERENCE_STALE_TIME,
  })

// `getSuppliers` (above) is shared with the suppliers list page, where a
// failed fetch must throw so the errorComponent kicks in — but this dropdown
// is non-core and, per the original design here, a materials-only role may
// lack `suppliers:read`. This query is `ensureQueryData`'d straight from a
// route loader (materials list/create/update), which doesn't catch — so
// degrading to `[]` has to happen in the queryFn itself, or a missing
// permission would crash the whole page instead of just leaving this picker
// empty.
export const supplierOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["suppliers", "options"],
    queryFn: () =>
      getSuppliers({ data: { limit: 100 } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })
