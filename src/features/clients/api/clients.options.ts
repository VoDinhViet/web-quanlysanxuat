import { queryOptions } from "@tanstack/react-query"

import { getClient } from "@/features/clients/api/server-functions/get-client.api"
import { getClientGroups } from "@/features/clients/api/server-functions/get-client-groups.api"
import { getClientOptions } from "@/features/clients/api/server-functions/get-client-options.api"
import { getClients } from "@/features/clients/api/server-functions/get-clients.api"
import type { ClientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"
import { REFERENCE_STALE_TIME } from "@/lib/constants"

// Query key convention (see .claude/rules/architecture.md): `["clients"]` is the
// feature root, so `invalidateQueries({ queryKey: ["clients"] })` after a write
// refreshes the list + the options dropdown in one call.
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

// Purpose-built dropdown endpoint (GET /api/clients/options) — shared across
// materials/products/orders via this feature's `api` barrel, see
// use-get-client-options.ts for the debounced combobox hook built on top.
export const clientOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["clients", "options", q],
    queryFn: () => getClientOptions({ data: { q } }),
    staleTime: REFERENCE_STALE_TIME,
  })
