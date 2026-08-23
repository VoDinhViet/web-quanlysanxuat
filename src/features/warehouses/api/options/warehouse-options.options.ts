import { queryOptions } from "@tanstack/react-query"

import { getWarehouseOptions } from "@/features/warehouses/api/server-functions/get-warehouse-options.api"
import type { GetWarehouseOptionsParams } from "@/features/warehouses/api/server-functions/get-warehouse-options.api"

// `warehouses` has no UI of its own (no components/pages) — it's an api-only
// feature, same as units/operations/countries: a reference resource with no
// screen of its own, consumed by inventory-materials (and, eventually,
// inventory-finished-goods). `type` optional — most callers want every kho
// (params omitted); inventory-requisitions passes `{type: "RM"}` to auto-resolve
// the single vật tư warehouse without showing a picker.
export const warehouseOptionsQueryOptions = (
  params: GetWarehouseOptionsParams = {}
) =>
  queryOptions({
    queryKey: ["warehouses", "options", params],
    queryFn: () => getWarehouseOptions({ data: params }),
    staleTime: 5 * 60_000,
  })
