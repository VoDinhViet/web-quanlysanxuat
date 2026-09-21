import { queryOptions } from "@tanstack/react-query"

import { getRoles } from "@/features/roles/api/server-functions/get-roles.api"

export const rolesQueryOptions = () =>
  queryOptions({
    queryKey: ["roles", "list"],
    queryFn: () => getRoles(),
    staleTime: 5 * 60_000,
  })
