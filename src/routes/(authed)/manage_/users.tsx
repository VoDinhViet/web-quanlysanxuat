import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { UsersPage } from "@/features/users/pages/UsersPage"
import { usersSearchSchema } from "@/features/users/schemas/users-search.schema"
import { usersQueryOptions } from "@/features/users/users.query"

export const Route = createFileRoute("/(authed)/manage_/users")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "users:update"),
  validateSearch: usersSearchSchema,
  loaderDeps: ({ search }) => search,
  // Prefetch into the query cache (SSR); the page reads it via useSuspenseQuery.
  // A thrown server-function error bubbles to the `errorComponent` on the
  // (authed) layout route — see .claude/rules/architecture.md.
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(usersQueryOptions(deps)),
  component: UsersPage,
})
