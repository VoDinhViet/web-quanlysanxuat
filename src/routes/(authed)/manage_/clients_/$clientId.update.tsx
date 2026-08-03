import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import {
  clientGroupOptionsQueryOptions,
  clientQueryOptions,
} from "@/features/clients/api/options"
import { UpdateClientPage } from "@/features/clients/pages/UpdateClientPage"

export const Route = createFileRoute(
  "/(authed)/manage_/clients_/$clientId/update"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "clients:update"),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(clientQueryOptions(params.clientId)),
      context.queryClient.ensureQueryData(clientGroupOptionsQueryOptions()),
    ]),
  component: UpdateClientPage,
  pendingComponent: PageLoading,
})
