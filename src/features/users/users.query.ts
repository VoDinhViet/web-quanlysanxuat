import { queryOptions } from "@tanstack/react-query"

import { getDepartments } from "@/features/users/server-functions/get-departments"
import { getPositions } from "@/features/users/server-functions/get-positions"
import { getUser } from "@/features/users/server-functions/get-user"
import { getUsers } from "@/features/users/server-functions/get-users"
import type { UsersSearchSchema } from "@/features/users/schemas/users-search.schema"

// Reference lists change rarely — cache them longer so moving between
// list/create/edit doesn't refetch on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

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
