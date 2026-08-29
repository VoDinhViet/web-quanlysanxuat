import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import {
  clientGroupOptionsQueryOptions,
  clientsQueryOptions,
} from "@/features/clients/api/options"
import { ClientsPage } from "@/features/clients/pages/ClientsPage"
import { clientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"

export const Route = createFileRoute("/(authed)/manage_/clients/")({
  validateSearch: clientsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and blank the outlet). The list
  // itself is read client-side in ClientsPage via useQuery instead.
  // `location.search` is already the router-validated search at runtime, but
  // LoaderFnContext types it as `{}` (loaderDeps-independent) — re-parsing it
  // is a type-safe way to recover the real shape, not an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        clientsQueryOptions(clientsSearchSchema.parse(location.search))
      ),
      context.queryClient.ensureQueryData(clientGroupOptionsQueryOptions()),
    ]),
  component: ClientsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
