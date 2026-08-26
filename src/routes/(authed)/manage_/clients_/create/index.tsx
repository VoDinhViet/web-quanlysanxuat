import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { clientGroupOptionsQueryOptions } from "@/features/clients/api/options"
import { CreateClientPage } from "@/features/clients/pages/CreateClientPage"

export const Route = createFileRoute("/(authed)/manage_/clients_/create/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(clientGroupOptionsQueryOptions()),
  component: CreateClientPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
