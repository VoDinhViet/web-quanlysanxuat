import { queryOptions } from "@tanstack/react-query"

import { getClientOptions } from "@/features/materials/server-functions/get-client-options"
import { getMaterial } from "@/features/materials/server-functions/get-material"
import { getMaterialGroupOptions } from "@/features/materials/server-functions/get-material-group-options"
import { getMaterialLogs } from "@/features/materials/server-functions/get-material-logs"
import { getMaterials } from "@/features/materials/server-functions/get-materials"
import { getSupplierOptions } from "@/features/materials/server-functions/get-supplier-options"
import { getUnitOptions } from "@/features/materials/server-functions/get-unit-options"
import type { MaterialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"

// Reference lists change rarely — cache them longer so moving between
// list/create/edit doesn't refetch on every navigation.
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

export const materialLogsQueryOptions = (
  materialId: string,
  page: number,
  limit: 10 | 20 | 50
) =>
  queryOptions({
    queryKey: ["materials", "logs", materialId, { page, limit }],
    queryFn: () => getMaterialLogs({ data: { materialId, page, limit } }),
  })

export const materialGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["materials", "group-options"],
    queryFn: () => getMaterialGroupOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })

export const unitOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["materials", "unit-options"],
    queryFn: () => getUnitOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })

export const supplierOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["materials", "supplier-options"],
    queryFn: () => getSupplierOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })

// `q` is the combobox search term; the loader prefetches `q === ""` (initial
// page) and the combobox hook keys off the debounced term for later lookups.
export const clientOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["materials", "client-options", q],
    queryFn: () => getClientOptions({ data: { q } }),
    staleTime: REFERENCE_STALE_TIME,
  })
