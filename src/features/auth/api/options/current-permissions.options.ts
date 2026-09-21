import { queryOptions } from "@tanstack/react-query"

import { getCurrentPermissions } from "@/features/auth/api/server-functions/get-current-permissions.api"

/**
 * The signed-in user's effective permission codes, fetched from `/api/users/me/permissions` and
 * cached separately from `currentUserQueryOptions` — so saving a role in the Phân quyền page can
 * invalidate just this key and have the sidebar/route guards pick up the change immediately,
 * without refetching the whole profile.
 */
export const currentPermissionsQueryOptions = queryOptions({
  queryKey: ["auth", "permissions"],
  queryFn: () => getCurrentPermissions(),
})
