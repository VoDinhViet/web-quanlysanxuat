import { queryOptions } from "@tanstack/react-query"

import { getOqc } from "@/features/oqc/api/server-functions/get-oqc.api"

export const oqcQueryOptions = (oqcId: string) =>
  queryOptions({
    queryKey: ["oqc", "detail", oqcId],
    queryFn: () => getOqc({ data: { oqcId } }),
  })
