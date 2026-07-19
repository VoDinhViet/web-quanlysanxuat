import { queryOptions } from "@tanstack/react-query"

import { getCountryFilterOptions } from "@/features/suppliers/server-functions/get-countries"
import { getSupplier } from "@/features/suppliers/server-functions/get-supplier"
import { getSupplierGroupFilterOptions } from "@/features/suppliers/server-functions/get-supplier-groups"
import { getSupplierStats } from "@/features/suppliers/server-functions/get-supplier-stats"
import { getSuppliers } from "@/features/suppliers/server-functions/get-suppliers"
import type { SuppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"

// Reference lists change rarely — cache them longer so moving between
// list/create/edit doesn't refetch on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Query key convention (see .claude/rules/architecture.md): `["suppliers"]` is
// the feature root, so `invalidateQueries({ queryKey: ["suppliers"] })` after a
// write refreshes list + stats + detail in one call.
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
    queryFn: () => getSupplierGroupFilterOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })

export const countryOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["suppliers", "country-options"],
    queryFn: () => getCountryFilterOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })
