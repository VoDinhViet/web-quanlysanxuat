import { queryOptions } from "@tanstack/react-query"

import { getDepartments } from "@/features/departments/api/server-functions/get-departments.api"
import type { DepartmentsSearchSchema } from "@/features/departments/schemas/departments-search.schema"

export const departmentsQueryOptions = (search: DepartmentsSearchSchema) =>
  queryOptions({
    queryKey: ["departments", "list", search],
    queryFn: () => getDepartments({ data: search }),
  })
