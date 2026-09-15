import { queryOptions } from "@tanstack/react-query"

import { getDepartments } from "@/features/departments/api/server-functions/get-departments.api"

// The reference-list read every other feature's form/filter uses (users, purchase-requests,
// ...) — full unfiltered set, long `staleTime`. The admin screen's own filtered list lives in
// `departmentsQueryOptions` instead.
export const departmentQueryOptions = () =>
  queryOptions({
    queryKey: ["departments", "options"],
    queryFn: async () => {
      const response = await getDepartments({ data: { limit: 100 } })
      return response.data
    },
    staleTime: 5 * 60_000,
  })
