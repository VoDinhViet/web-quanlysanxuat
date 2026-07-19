import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateUserPage } from "@/features/users/pages/CreateUserPage"
import {
  departmentsQueryOptions,
  positionsQueryOptions,
} from "@/features/users/users.query"

export const Route = createFileRoute("/(authed)/manage_/users_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "users:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(departmentsQueryOptions()),
      context.queryClient.ensureQueryData(positionsQueryOptions()),
    ]),
  component: CreateUserPage,
})
