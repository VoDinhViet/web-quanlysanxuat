import { queryOptions } from "@tanstack/react-query"

import { getIqcs } from "@/features/iqc/api/server-functions/get-iqcs.api"
import type { IqcSearchSchema } from "@/features/iqc/schemas/iqc-search.schema"

export const iqcsQueryOptions = (search: IqcSearchSchema) =>
  queryOptions({
    queryKey: ["iqc", "list", search],
    queryFn: () => getIqcs({ data: search }),
  })
