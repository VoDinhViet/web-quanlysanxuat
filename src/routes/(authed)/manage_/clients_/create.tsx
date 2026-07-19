import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { clientGroupOptionsQueryOptions } from "@/features/clients/clients.query"
import { CreateClientPage } from "@/features/clients/pages/CreateClientPage"

export const Route = createFileRoute("/(authed)/manage_/clients_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "clients:create"),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(clientGroupOptionsQueryOptions()),
  component: CreateClientPage,
})
