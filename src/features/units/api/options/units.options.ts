import { queryOptions } from "@tanstack/react-query"

import { getUnits } from "@/features/units/api/server-functions/get-units.api"
import type { UnitsSearchSchema } from "@/features/units/schemas/units-search.schema"

// Key holds only the three backend filters, so a filter change refetches and nothing else does.
export const unitsQueryOptions = ({ q, type, status }: UnitsSearchSchema) =>
  queryOptions({
    queryKey: ["units", "list", { q, type, status }],
    queryFn: () => getUnits({ data: { q, type, status } }),
  })
