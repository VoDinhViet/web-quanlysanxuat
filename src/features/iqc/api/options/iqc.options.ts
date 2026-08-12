import { queryOptions } from "@tanstack/react-query"

import { getIqc } from "@/features/iqc/api/server-functions/get-iqc.api"

export const iqcQueryOptions = (iqcId: string) =>
  queryOptions({
    queryKey: ["iqc", "detail", iqcId],
    queryFn: () => getIqc({ data: { iqcId } }),
  })
