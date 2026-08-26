import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/feedback/LayoutPagePending"
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
  pendingComponent: LayoutPagePending,
})
