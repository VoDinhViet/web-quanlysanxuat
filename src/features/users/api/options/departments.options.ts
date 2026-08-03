import { queryOptions } from "@tanstack/react-query"

import { getDepartments } from "@/features/users/api/server-functions/get-departments.api"

export const departmentsQueryOptions = () =>
  queryOptions({
    queryKey: ["users", "departments"],
    queryFn: () => getDepartments(),
    staleTime: 5 * 60_000,
  })
