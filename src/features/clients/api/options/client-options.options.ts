import { queryOptions } from "@tanstack/react-query"

import { getClientOptions } from "@/features/clients/api/server-functions/get-client-options.api"

// Purpose-built dropdown endpoint (GET /api/clients/options) — shared across
// materials/products/orders via this feature's `api` barrel, see
// use-get-client-options.ts for the debounced combobox hook built on top.
export const clientOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["clients", "options", q],
    queryFn: () => getClientOptions({ data: { q } }),
    staleTime: 5 * 60_000,
  })
