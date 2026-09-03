import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { UsersPage } from "@/features/users/pages/UsersPage"
import { usersSearchSchema } from "@/features/users/schemas/users-search.schema"
import { usersQueryOptions } from "@/features/users/api/options"

export const Route = createFileRoute("/(authed)/manage_/users/")({
  validateSearch: usersSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and blank the outlet). The list
  // itself is read client-side in UsersPage via useQuery instead.
  // `location.search` is already the router-validated search at runtime, but
  // LoaderFnContext types it as `{}` (loaderDeps-independent) — re-parsing it
  // is a type-safe way to recover the real shape, not an `as` cast. A thrown
  // server-function error bubbles to the `errorComponent` on the (authed)
  // layout route — see .claude/rules/architecture.md.
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...usersQueryOptions(usersSearchSchema.parse(location.search)),
      staleTime: "static",
    }),
  component: UsersPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
