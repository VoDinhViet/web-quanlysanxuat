import { queryOptions } from "@tanstack/react-query"

import { getWarehouseOptions } from "@/features/warehouses/api/server-functions/get-warehouse-options.api"

// `warehouses` has no UI of its own (no components/pages) — it's an api-only
// feature, same as units/operations/countries: a reference resource with no
// screen of its own, consumed by inventory-materials (and, eventually,
// inventory-finished-goods).
export const warehouseOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["warehouses", "options"],
    queryFn: () => getWarehouseOptions(),
    staleTime: 5 * 60_000,
  })
