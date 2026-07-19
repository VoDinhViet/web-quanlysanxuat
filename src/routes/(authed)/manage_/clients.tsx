import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import {
  clientGroupOptionsQueryOptions,
  clientsQueryOptions,
} from "@/features/clients/clients.query"
import { ClientsPage } from "@/features/clients/pages/ClientsPage"
import { clientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"

export const Route = createFileRoute("/(authed)/manage_/clients")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "clients:read"),
  validateSearch: clientsSearchSchema,
  loaderDeps: ({ search }) => search,
  // Prefetch into the query cache (SSR); the page reads the same options via
  // useSuspenseQuery — see .claude/rules/architecture.md.
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(clientsQueryOptions(deps)),
      context.queryClient.ensureQueryData(clientGroupOptionsQueryOptions()),
    ]),
  component: ClientsPage,
})
