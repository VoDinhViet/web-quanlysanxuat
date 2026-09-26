import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { operationsQueryOptions } from "@/features/operations/api/options"
import { OperationsPage } from "@/features/operations/pages/OperationsPage"
import { operationsSearchSchema } from "@/features/operations/schemas/operations-search.schema"

export const Route = createFileRoute("/(authed)/manage_/settings/operations")({
  validateSearch: operationsSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...operationsQueryOptions(operationsSearchSchema.parse(location.search)),
      staleTime: "static",
    }),
  component: OperationsPage,
  pendingComponent: PagePending,
})
