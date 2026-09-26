import { queryOptions } from "@tanstack/react-query"

import { getOperationAssignments } from "@/features/operations/api/server-functions/get-operation-assignments.api"

type OperationAssignmentsParams = {
  operationId: string
  page: number
  limit: number
  q?: string
  departmentId?: string
  positionId?: string
}

export const operationAssignmentsQueryOptions = (
  params: OperationAssignmentsParams
) =>
  queryOptions({
    queryKey: ["operations", "assignments", "list", params],
    queryFn: () => getOperationAssignments({ data: params }),
  })
