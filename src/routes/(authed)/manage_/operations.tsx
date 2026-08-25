import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { operationsQueryOptions } from "@/features/operations/api/options"
import { OperationsPage } from "@/features/operations/pages/OperationsPage"

export const Route = createFileRoute("/(authed)/manage_/operations")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(operationsQueryOptions()),
  component: OperationsPage,
  pendingComponent: PageLoading,
})
