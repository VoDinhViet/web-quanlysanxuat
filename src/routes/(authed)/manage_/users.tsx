import { createFileRoute } from "@tanstack/react-router"

import { UsersPage } from "@/features/users/pages/users-page"
import { usersSearchSchema } from "@/features/users/schemas/users-search.schema"
import { getUsers } from "@/features/users/server-functions/get-users"

export const Route = createFileRoute("/(authed)/manage_/users")({
  validateSearch: usersSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getUsers({ data: deps }),
  component: UsersPage,
  // no explicit try/catch here — a thrown server-function error bubbles to the
  // `errorComponent` defined on the (authed) layout route
})
