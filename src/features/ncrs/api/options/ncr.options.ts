import { queryOptions } from "@tanstack/react-query"

import { getNcr } from "@/features/ncrs/api/server-functions/get-ncr.api"

export const ncrQueryOptions = (ncrId: string) =>
  queryOptions({
    queryKey: ["ncrs", "detail", ncrId],
    queryFn: () => getNcr({ data: { ncrId } }),
  })
