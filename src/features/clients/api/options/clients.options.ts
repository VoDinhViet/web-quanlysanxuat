import { queryOptions } from "@tanstack/react-query"

import { getClients } from "@/features/clients/api/server-functions/get-clients.api"
import type { ClientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"

export const clientsQueryOptions = (search: ClientsSearchSchema) =>
  queryOptions({
    queryKey: ["clients", "list", search],
    queryFn: () => getClients({ data: search }),
  })
