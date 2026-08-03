import { queryOptions } from "@tanstack/react-query"

import { getUser } from "@/features/users/api/server-functions/get-user.api"

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", "detail", userId],
    queryFn: () => getUser({ data: { userId } }),
  })
