import { queryOptions } from "@tanstack/react-query"

import { getClientGroups } from "@/features/clients/api/server-functions/get-client-groups.api"

export const clientGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["clients", "group-options"],
    queryFn: () => getClientGroups(),
    staleTime: 5 * 60_000,
  })
