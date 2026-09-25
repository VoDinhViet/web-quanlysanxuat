import { queryOptions } from "@tanstack/react-query"

import { getDirects } from "@/features/directs/api/server-functions/get-directs.api"
import type { DirectsSearchSchema } from "@/features/directs/schemas/directs-search.schema"

// `limit` loosened to a plain number here rather than reusing the route's own literal 10|20|50
// union — that union is `/manage/directs`'s own `validateSearch` contract (matching
// Pagination's pageSizeOptions), not a wire constraint (get-directs.api.ts's own schema
// already accepts any `limit >= 1`, same reasoning as its "broader than any single caller's own
// search schema" comment). A caller with no page-size selector — the "Thêm vật tư" dialog picker,
// DirectsPickerTable.tsx — needs a shorter fixed page (6) than the route ever offers.
type DirectsQuery = Omit<DirectsSearchSchema, "limit"> & {
  limit: number
}

export const directsQueryOptions = (search: DirectsQuery) =>
  queryOptions({
    queryKey: ["directs", "list", search],
    queryFn: () => getDirects({ data: search }),
  })
