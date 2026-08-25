import { queryOptions } from "@tanstack/react-query"

import { getUnits } from "@/features/units/api/server-functions/get-units.api"
import type { UnitScope } from "@/lib/types/unit.type"

// Reference-option list read by materials/products, scoped to the kind of
// entity being created/updated (see get-units.api.ts's comment on `scope`).
export const unitOptionsQueryOptions = (scope: UnitScope) =>
  queryOptions({
    queryKey: ["units", "options", scope],
    queryFn: () => getUnits({ data: { scope } }),
    staleTime: 5 * 60_000,
  })
