import { queryOptions } from "@tanstack/react-query"

import { getUserOptions } from "@/features/users/api/server-functions/get-user-options.api"

// Purpose-built dropdown endpoint (GET /api/users/options) — see
// use-get-user-options.ts (purchase-orders feature) for the debounced combobox hook built on
// top, mirroring use-get-client-options.ts.
export const userOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["users", "options", q],
    queryFn: () => getUserOptions({ data: { q } }),
    staleTime: 5 * 60_000,
  })
