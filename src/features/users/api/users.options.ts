import { queryOptions } from "@tanstack/react-query"

import { getDepartments } from "@/features/users/api/server-functions/get-departments.api"
import { getPositions } from "@/features/users/api/server-functions/get-positions.api"
import { getRoles } from "@/features/users/api/server-functions/get-roles.api"
import { getUser } from "@/features/users/api/server-functions/get-user.api"
import { getUsers } from "@/features/users/api/server-functions/get-users.api"
import type { UsersSearchSchema } from "@/features/users/schemas/users-search.schema"
import { REFERENCE_STALE_TIME } from "@/lib/constants"

// Query key convention (see .claude/rules/architecture.md): `["users"]` is the
// feature root, so `invalidateQueries({ queryKey: ["users"] })` after a write
// refreshes list + detail in one call.
export const usersQueryOptions = (search: UsersSearchSchema) =>
  queryOptions({
    queryKey: ["users", "list", search],
    queryFn: () => getUsers({ data: search }),
  })

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", "detail", userId],
    queryFn: () => getUser({ data: { userId } }),
  })

export const departmentsQueryOptions = () =>
  queryOptions({
    queryKey: ["users", "departments"],
    queryFn: () => getDepartments(),
    staleTime: REFERENCE_STALE_TIME,
  })

export const positionsQueryOptions = () =>
  queryOptions({
    queryKey: ["users", "positions"],
    queryFn: () => getPositions(),
    staleTime: REFERENCE_STALE_TIME,
  })

export const rolesQueryOptions = () =>
  queryOptions({
    queryKey: ["users", "roles"],
    queryFn: () => getRoles(),
    staleTime: REFERENCE_STALE_TIME,
  })
