import { queryOptions } from "@tanstack/react-query"

import { getConsumables } from "@/features/consumables/api/server-functions/get-consumables.api"
import type { ConsumablesSearchSchema } from "@/features/consumables/schemas/consumables-search.schema"

export const consumablesQueryOptions = (search: ConsumablesSearchSchema) =>
  queryOptions({
    queryKey: ["consumables", "list", search],
    queryFn: () => getConsumables({ data: search }),
  })
