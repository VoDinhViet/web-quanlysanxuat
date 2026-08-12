import { queryOptions } from "@tanstack/react-query"

import { getIqcStats } from "@/features/iqc/api/server-functions/get-iqc-stats.api"

export const iqcStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["iqc", "stats"],
    queryFn: () => getIqcStats(),
  })
