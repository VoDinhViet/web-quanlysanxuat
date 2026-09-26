import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { operationQueryOptions } from "@/features/operations/api/options"
import { OperationDetailPage } from "@/features/operations/pages/OperationDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/operations_/$operationId"
)({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...operationQueryOptions(params.operationId),
      staleTime: "static",
    }),
  component: OperationDetailPage,
  pendingComponent: LayoutPagePending,
})
