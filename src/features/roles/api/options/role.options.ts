import { queryOptions } from "@tanstack/react-query"

import { getRole } from "@/features/roles/api/server-functions/get-role.api"

export const roleQueryOptions = (roleId: string) =>
  queryOptions({
    queryKey: ["roles", "detail", roleId],
    queryFn: () => getRole({ data: { roleId } }),
  })
