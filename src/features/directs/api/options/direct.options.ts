import { queryOptions } from "@tanstack/react-query"

import { getDirect } from "@/features/directs/api/server-functions/get-direct.api"

export const directQueryOptions = (directId: string) =>
  queryOptions({
    queryKey: ["directs", "detail", directId],
    queryFn: () => getDirect({ data: { directId } }),
  })
