import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { CreateUserPage } from "@/features/users/pages/CreateUserPage"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import {
  positionsQueryOptions,
  rolesQueryOptions,
} from "@/features/users/api/options"

export const Route = createFileRoute("/(authed)/manage_/users_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "users:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(departmentOptionsQueryOptions()),
      context.queryClient.ensureQueryData(positionsQueryOptions()),
      context.queryClient.ensureQueryData(rolesQueryOptions()),
    ]),
  component: CreateUserPage,
  pendingComponent: PageLoading,
})
