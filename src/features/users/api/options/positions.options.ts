import { queryOptions } from "@tanstack/react-query"

import { getPositions } from "@/features/users/api/server-functions/get-positions.api"

export const positionsQueryOptions = () =>
  queryOptions({
    queryKey: ["users", "positions"],
    queryFn: () => getPositions(),
    staleTime: 5 * 60_000,
  })
