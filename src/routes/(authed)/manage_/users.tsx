import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { UsersPage } from "@/features/users/pages/UsersPage"
import { usersSearchSchema } from "@/features/users/schemas/users-search.schema"
import { usersQueryOptions } from "@/features/users/api/users.options"

export const Route = createFileRoute("/(authed)/manage_/users")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "users:update"),
  validateSearch: usersSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and the router's
  // defaultPendingComponent, blanking the whole page). The list itself is
  // read client-side in UsersPage via useQuery instead. `location.search` is
  // already the router-validated search at runtime, but LoaderFnContext types
  // it as `{}` (loaderDeps-independent) — re-parsing it is a type-safe way to
  // recover the real shape, not an `as` cast. A thrown server-function error
  // bubbles to the `errorComponent` on the (authed) layout route — see
  // .claude/rules/architecture.md.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      usersQueryOptions(usersSearchSchema.parse(location.search))
    ),
  component: UsersPage,
  pendingComponent: PageLoading,
})
