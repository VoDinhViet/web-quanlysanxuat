import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import {
  clientGroupOptionsQueryOptions,
  clientQueryOptions,
} from "@/features/clients/api/options"
import { UpdateClientPage } from "@/features/clients/pages/UpdateClientPage"

export const Route = createFileRoute(
  "/(authed)/manage_/clients_/$clientId/update"
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(clientQueryOptions(params.clientId)),
      context.queryClient.ensureQueryData(clientGroupOptionsQueryOptions()),
    ]),
  component: UpdateClientPage,
  pendingComponent: PageLoading,
})
