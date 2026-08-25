import { queryOptions } from "@tanstack/react-query"

import { getUnits } from "@/features/units/api/server-functions/get-units.api"
import type { UnitsSearchSchema } from "@/features/units/schemas/units-search.schema"

export const unitsQueryOptions = (search: UnitsSearchSchema) =>
  queryOptions({
    queryKey: ["units", "list", search],
    queryFn: () => getUnits({ data: search }),
  })
