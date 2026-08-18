import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { UpdateUserPage } from "@/features/users/pages/UpdateUserPage"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import {
  positionsQueryOptions,
  rolesQueryOptions,
  userQueryOptions,
} from "@/features/users/api/options"

export const Route = createFileRoute("/(authed)/manage_/users_/$userId/update")(
  {
    loader: ({ context, params }) =>
      Promise.all([
        context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
        context.queryClient.ensureQueryData(departmentOptionsQueryOptions()),
        context.queryClient.ensureQueryData(positionsQueryOptions()),
        context.queryClient.ensureQueryData(rolesQueryOptions()),
      ]),
    component: UpdateUserPage,
    pendingComponent: PageLoading,
  }
)
