import { queryOptions } from "@tanstack/react-query"

import { getClient } from "@/features/clients/server-functions/get-client"
import type { ClientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"
import { getClientGroups } from "@/lib/server-functions/get-client-groups"
import { getClients } from "@/lib/server-functions/get-clients"

// Reference lists change rarely — cache them longer so moving between
// list/create doesn't refetch on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Query key convention (see .claude/rules/architecture.md): `["clients"]` is the
// feature root, so `invalidateQueries({ queryKey: ["clients"] })` after a write
// refreshes the list in one call.
export const clientsQueryOptions = (search: ClientsSearchSchema) =>
  queryOptions({
    queryKey: ["clients", "list", search],
    queryFn: () => getClients({ data: search }),
  })

export const clientQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ["clients", "detail", clientId],
    queryFn: () => getClient({ data: { clientId } }),
  })

export const clientGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["clients", "group-options"],
    queryFn: () => getClientGroups(),
    staleTime: REFERENCE_STALE_TIME,
  })
