import { queryOptions } from "@tanstack/react-query"

import { getOpenNcr } from "@/features/reports/api/server-functions/get-open-ncr.api"

export const openNcrQueryOptions = () =>
  queryOptions({
    queryKey: ["reports", "open-ncr"],
    queryFn: () => getOpenNcr(),
  })
