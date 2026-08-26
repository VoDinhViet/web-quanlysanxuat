import { queryOptions } from "@tanstack/react-query"

import { getCurrentSession } from "@/features/auth/api/server-functions/get-current-session.api"

/**
 * Session validity + userId, read from the httpOnly cookie (and proactively refreshed when the
 * access token is close to expiry — see getCurrentSession.api.ts). Cached like every other read
 * in the `(authed)` layout's `beforeLoad` (default 60s staleTime, src/router.tsx) so navigating
 * between pages doesn't force a fresh round trip on every click — that used to push beforeLoad
 * past defaultPendingMs and remount the whole sidebar shell into AuthedLayoutPending (see
 * guard.ts). useSessionWatchdog polls independently every 5 min / on focus with staleTime: 0, so
 * idle-tab expiry detection is unaffected by this cache window.
 */
export const currentSessionQueryOptions = queryOptions({
  queryKey: ["auth", "current-session"],
  queryFn: () => getCurrentSession(),
})
