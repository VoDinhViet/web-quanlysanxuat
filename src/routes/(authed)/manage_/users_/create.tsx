import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { CreateUserPage } from "@/features/users/pages/CreateUserPage"
import {
  departmentsQueryOptions,
  positionsQueryOptions,
  rolesQueryOptions,
} from "@/features/users/api/users.options"

export const Route = createFileRoute("/(authed)/manage_/users_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "users:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(departmentsQueryOptions()),
      context.queryClient.ensureQueryData(positionsQueryOptions()),
      context.queryClient.ensureQueryData(rolesQueryOptions()),
    ]),
  component: CreateUserPage,
  pendingComponent: PageLoading,
})
