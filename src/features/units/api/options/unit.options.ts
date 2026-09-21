import { queryOptions } from "@tanstack/react-query"

import { getUnit } from "@/features/units/api/server-functions/get-unit.api"

export const unitQueryOptions = (unitId: string) =>
  queryOptions({
    queryKey: ["units", "detail", unitId],
    queryFn: () => getUnit({ data: { unitId } }),
  })
