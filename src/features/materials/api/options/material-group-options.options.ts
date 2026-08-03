import { queryOptions } from "@tanstack/react-query"

import { getMaterialGroups } from "@/features/materials/api/server-functions/get-material-groups.api"

export const materialGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["materials", "group-options"],
    queryFn: () => getMaterialGroups(),
    staleTime: 5 * 60_000,
  })
