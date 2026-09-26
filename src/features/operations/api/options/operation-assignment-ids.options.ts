import { queryOptions } from "@tanstack/react-query"

import { getOperationAssignmentIds } from "@/features/operations/api/server-functions/get-operation-assignment-ids.api"

export const operationAssignmentIdsQueryOptions = (operationId: string) =>
  queryOptions({
    queryKey: ["operations", "assignments", "ids", operationId],
    queryFn: () => getOperationAssignmentIds({ data: { operationId } }),
  })
