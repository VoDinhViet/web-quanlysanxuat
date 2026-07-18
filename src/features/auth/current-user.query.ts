import { queryOptions } from "@tanstack/react-query"

import { getCurrentProfile } from "@/features/auth/server-functions/get-current-profile"

/**
 * The signed-in user's profile + RBAC (role, permissions), fetched once from
 * `/api/users/me` and cached. Loaded in the `(authed)` layout's `beforeLoad`
 * (via `ensureQueryData`) so route guards can read permissions, and read in
 * components via `useQuery`/`useHasPermission` without refetching.
 */
export const currentUserQueryOptions = queryOptions({
  queryKey: ["auth", "current-user"],
  queryFn: () => getCurrentProfile(),
})
