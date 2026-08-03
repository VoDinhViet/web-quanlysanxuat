import { queryOptions } from "@tanstack/react-query"

import { getUnits } from "@/features/units/api/server-functions/get-units.api"
import type { UnitScope } from "@/features/units/api/server-functions/get-units.api"

// `units` has no UI of its own (no components/pages) — it's an api-only
// feature, same as operations/countries: a reference resource with more than
// one consumer (materials, products), so it isn't owned by either.
export const unitOptionsQueryOptions = (scope: UnitScope) =>
  queryOptions({
    queryKey: ["units", "options", scope],
    queryFn: () => getUnits({ data: { scope } }),
    staleTime: 5 * 60_000,
  })
