import { queryOptions } from "@tanstack/react-query"

import { getRoles } from "@/features/users/api/server-functions/get-roles.api"

export const rolesQueryOptions = () =>
  queryOptions({
    queryKey: ["users", "roles"],
    queryFn: () => getRoles(),
    staleTime: 5 * 60_000,
  })
