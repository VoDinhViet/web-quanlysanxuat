import { queryOptions } from "@tanstack/react-query"

import { getDepartment } from "@/features/departments/api/server-functions/get-department.api"

export const departmentDetailQueryOptions = (departmentId: string) =>
  queryOptions({
    queryKey: ["departments", "detail", departmentId],
    queryFn: () => getDepartment({ data: { departmentId } }),
  })
