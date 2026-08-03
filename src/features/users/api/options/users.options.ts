import { queryOptions } from "@tanstack/react-query"

import { getUsers } from "@/features/users/api/server-functions/get-users.api"
import type { UsersSearchSchema } from "@/features/users/schemas/users-search.schema"

export const usersQueryOptions = (search: UsersSearchSchema) =>
  queryOptions({
    queryKey: ["users", "list", search],
    queryFn: () => getUsers({ data: search }),
  })
