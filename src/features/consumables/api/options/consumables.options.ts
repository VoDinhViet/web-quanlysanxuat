import { queryOptions } from "@tanstack/react-query"

import { getConsumables } from "@/features/consumables/api/server-functions/get-consumables.api"
import type { ConsumablesSearchSchema } from "@/features/consumables/schemas/consumables-search.schema"

// `limit` loosened to a plain number here rather than reusing the route's own literal 10|20|50
// union — that union is `/manage/consumables`'s own `validateSearch` contract (matching
// Pagination's pageSizeOptions), not a wire constraint (get-consumables.api.ts's own schema
// already accepts any `limit >= 1`, same reasoning as its "broader than any single caller's own
// search schema" comment). A caller with no page-size selector — the "Thêm vật tư" dialog picker,
// ConsumablesPickerTable.tsx — needs a shorter fixed page (6) than the route ever offers.
type ConsumablesQuery = Omit<ConsumablesSearchSchema, "limit"> & {
  limit: number
}

export const consumablesQueryOptions = (search: ConsumablesQuery) =>
  queryOptions({
    queryKey: ["consumables", "list", search],
    queryFn: () => getConsumables({ data: search }),
  })
