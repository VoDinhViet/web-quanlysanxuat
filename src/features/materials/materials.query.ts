import { queryOptions } from "@tanstack/react-query"

import { getMaterial } from "@/features/materials/server-functions/get-material"
import type { MaterialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"
import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { getMaterialGroups } from "@/lib/server-functions/get-material-groups"
import { getMaterials } from "@/lib/server-functions/get-materials"
import { getSuppliers } from "@/lib/server-functions/get-suppliers"
import { getUnits } from "@/lib/server-functions/get-units"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Query key convention (see .claude/rules/architecture.md): `["materials"]` is
// the feature root, so `invalidateQueries({ queryKey: ["materials"] })` after a
// write refreshes list + detail in one call.
export const materialsQueryOptions = (search: MaterialsSearchSchema) =>
  queryOptions({
    queryKey: ["materials", "list", search],
    queryFn: () => getMaterials({ data: search }),
  })

export const materialQueryOptions = (materialId: string) =>
  queryOptions({
    queryKey: ["materials", "detail", materialId],
    queryFn: () => getMaterial({ data: { materialId } }),
  })

export const materialGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["materials", "group-options"],
    queryFn: () => getMaterialGroups(),
    staleTime: REFERENCE_STALE_TIME,
  })

export const unitOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["materials", "unit-options"],
    queryFn: () => getUnits({ data: { scope: "MATERIAL" } }),
    staleTime: REFERENCE_STALE_TIME,
  })

// `getSuppliers` (below) is shared with the suppliers list page, where a
// failed fetch must throw so the errorComponent kicks in — but this dropdown
// is non-core and, per the original design here, a materials-only role may
// lack `suppliers:read`. This query is `ensureQueryData`'d straight from a
// route loader (materials list/create/update), which doesn't catch — so
// degrading to `[]` has to happen in the queryFn itself, or a missing
// permission would crash the whole page instead of just leaving this picker
// empty.
export const supplierOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["materials", "supplier-options"],
    queryFn: () =>
      getSuppliers({ data: { limit: FILTER_OPTIONS_LIMIT } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })
