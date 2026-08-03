import { queryOptions } from "@tanstack/react-query"

import { getClient } from "@/features/clients/api/server-functions/get-client.api"

export const clientQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ["clients", "detail", clientId],
    queryFn: () => getClient({ data: { clientId } }),
  })
