import { queryOptions } from "@tanstack/react-query"

import { getJobDueDate } from "@/features/reports/api/server-functions/get-job-due-date.api"

export const jobDueDateQueryOptions = () =>
  queryOptions({
    queryKey: ["reports", "job-due-date"],
    queryFn: () => getJobDueDate(),
  })
