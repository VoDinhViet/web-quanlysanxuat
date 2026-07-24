import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { UpdateUserPage } from "@/features/users/pages/UpdateUserPage"
import {
  departmentsQueryOptions,
  positionsQueryOptions,
  rolesQueryOptions,
  userQueryOptions,
} from "@/features/users/users.query"

export const Route = createFileRoute("/(authed)/manage_/users_/$userId/update")(
  {
    beforeLoad: ({ context }) =>
      requirePermission(context.permissions, "users:update"),
    loader: ({ context, params }) =>
      Promise.all([
        context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
        context.queryClient.ensureQueryData(departmentsQueryOptions()),
        context.queryClient.ensureQueryData(positionsQueryOptions()),
        context.queryClient.ensureQueryData(rolesQueryOptions()),
      ]),
    component: UpdateUserPage,
  }
)
