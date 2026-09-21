import { queryOptions } from "@tanstack/react-query"

import { getOqcs } from "@/features/oqc/api/server-functions/get-oqcs.api"
import type { OqcSearchSchema } from "@/features/oqc/schemas/oqc-search.schema"

export const oqcsQueryOptions = (search: OqcSearchSchema) =>
  queryOptions({
    queryKey: ["oqc", "list", search],
    queryFn: () => getOqcs({ data: search }),
  })
