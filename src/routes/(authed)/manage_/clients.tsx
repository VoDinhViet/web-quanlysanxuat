import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { ClientsPage } from "@/features/clients/pages/ClientsPage"
import { clientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"
import { getClientGroupFilterOptions } from "@/features/clients/server-functions/get-client-groups"
import { getClients } from "@/features/clients/server-functions/get-clients"

export const Route = createFileRoute("/(authed)/manage_/clients")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "clients:read"),
  validateSearch: clientsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [clients, clientGroupOptions] = await Promise.all([
      getClients({ data: deps }),
      getClientGroupFilterOptions(),
    ])

    return { clients, clientGroupOptions }
  },
  component: ClientsPage,
})
