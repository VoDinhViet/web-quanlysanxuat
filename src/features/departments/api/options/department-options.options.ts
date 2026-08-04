import { queryOptions } from "@tanstack/react-query"

import { getDepartments } from "@/features/departments/api/server-functions/get-departments.api"

// `departments` has no UI of its own (no components/pages) — it's an api-only
// feature, same as units/operations/countries: a reference resource with more
// than one consumer (users, purchase-requests), so it isn't owned by either.
export const departmentOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["departments", "options"],
    queryFn: () => getDepartments(),
    staleTime: 5 * 60_000,
  })
