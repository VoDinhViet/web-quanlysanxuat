import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateClientPage } from "@/features/clients/pages/CreateClientPage"
import { getClientGroupFilterOptions } from "@/features/clients/server-functions/get-client-groups"

export const Route = createFileRoute("/(authed)/manage_/clients_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "clients:create"),
  loader: async () => {
    const clientGroupOptions = await getClientGroupFilterOptions()

    return { clientGroupOptions }
  },
  component: CreateClientPage,
})
