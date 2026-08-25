import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { operationQueryOptions } from "@/features/operations/api/options"
import { UpdateOperationPage } from "@/features/operations/pages/UpdateOperationPage"

export const Route = createFileRoute(
  "/(authed)/manage_/operations_/$operationId/update"
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      operationQueryOptions(params.operationId)
    ),
  component: UpdateOperationPage,
  pendingComponent: PageLoading,
})
