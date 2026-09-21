import { queryOptions } from "@tanstack/react-query"

import { getUnits } from "@/features/units/api/server-functions/get-units.api"
import type { UnitScope } from "@/lib/types/unit.type"

// Reference-option list read by consumables/products, scoped to the kind of
// entity being created/updated (see get-units.api.ts's comment on `scope`).
// Omit `scope` for a picker that isn't validated against unit scope at all —
// currently only the BOM COMPONENT unit picker (docs/decisions/unit-conversion.md-style choice,
// not enforced server-side for that field).
export const unitOptionsQueryOptions = (scope?: UnitScope) =>
  queryOptions({
    queryKey: ["units", "options", scope ?? "ALL"],
    queryFn: () => getUnits({ data: { scope } }),
    staleTime: 5 * 60_000,
  })
