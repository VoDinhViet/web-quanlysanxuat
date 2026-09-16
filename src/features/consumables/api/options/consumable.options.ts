import { queryOptions } from "@tanstack/react-query"

import { getConsumable } from "@/features/consumables/api/server-functions/get-consumable.api"

export const consumableQueryOptions = (consumableId: string) =>
  queryOptions({
    queryKey: ["consumables", "detail", consumableId],
    queryFn: () => getConsumable({ data: { consumableId } }),
  })
