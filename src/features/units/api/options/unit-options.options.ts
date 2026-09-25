import { queryOptions } from "@tanstack/react-query"

import { getUnits } from "@/features/units/api/server-functions/get-units.api"

// Reference-option list read by directs/products/BOM pickers.
export const unitOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["units", "options"],
    queryFn: () => getUnits({ data: {} }),
    staleTime: 5 * 60_000,
  })
