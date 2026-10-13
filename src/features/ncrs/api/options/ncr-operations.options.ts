import { queryOptions } from "@tanstack/react-query"

import { getNcrOperations } from "@/features/ncrs/api/server-functions/get-ncr-operations.api"

export const ncrOperationsQueryOptions = (ncrId: string) =>
  queryOptions({
    queryKey: ["ncrs", "detail", ncrId, "operations"],
    queryFn: () => getNcrOperations({ data: { ncrId } }),
    staleTime: 5 * 60_000,
  })
