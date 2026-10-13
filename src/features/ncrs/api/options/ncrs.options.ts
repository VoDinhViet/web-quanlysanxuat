import { queryOptions } from "@tanstack/react-query"

import { getNcrs } from "@/features/ncrs/api/server-functions/get-ncrs.api"
import type { NcrsSearchSchema } from "@/features/ncrs/schemas/ncrs-search.schema"

export const ncrsQueryOptions = (search: NcrsSearchSchema) =>
  queryOptions({
    queryKey: ["ncrs", "list", search],
    queryFn: () => getNcrs({ data: search }),
  })
