import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { clientGroupOptionsQueryOptions } from "@/features/clients/api/options"
import { CreateClientPage } from "@/features/clients/pages/CreateClientPage"

export const Route = createFileRoute("/(authed)/manage_/clients_/create")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(clientGroupOptionsQueryOptions()),
  component: CreateClientPage,
  pendingComponent: PageLoading,
})
