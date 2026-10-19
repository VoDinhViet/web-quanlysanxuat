import { queryOptions } from "@tanstack/react-query"

import { getAskConfig } from "@/features/ask/api/server-functions/get-ask-config.api"

// The config only changes with a server restart. A finite window (not `Infinity`) so the `null`
// a signed-out read can return is retried after a new sign-in instead of sticking.
export const askConfigQueryOptions = () =>
  queryOptions({
    queryKey: ["ask", "config"],
    queryFn: () => getAskConfig(),
    staleTime: 10 * 60 * 1000,
  })
