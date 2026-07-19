import { queryOptions } from "@tanstack/react-query"

import { getClientGroupFilterOptions } from "@/features/clients/server-functions/get-client-groups"
import { getClients } from "@/features/clients/server-functions/get-clients"
import type { ClientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"

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

export const clientGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["clients", "group-options"],
    queryFn: () => getClientGroupFilterOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })
