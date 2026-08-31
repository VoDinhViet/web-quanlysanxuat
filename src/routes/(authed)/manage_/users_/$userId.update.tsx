import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { UpdateUserPage } from "@/features/users/pages/UpdateUserPage"
import { departmentQueryOptions } from "@/features/departments/api"
import {
  positionsQueryOptions,
  userQueryOptions,
} from "@/features/users/api/options"

// `positionsQueryOptions` needs the user's current `departmentId`, only known after the user
// itself resolves — so this loader awaits it first instead of one flat `Promise.all`.
// `rolesQueryOptions` needs `roles:read`, which this route doesn't require (UpdateUserCredentialSection
// fetches it itself via `useQuery`, tolerating 403).
export const Route = createFileRoute("/(authed)/manage_/users_/$userId/update")(
  {
    loader: async ({ context, params }) => {
      const user = await context.queryClient.ensureQueryData(
        userQueryOptions(params.userId)
      )

      await Promise.all([
        context.queryClient.ensureQueryData(departmentQueryOptions()),
        context.queryClient.ensureQueryData(
          positionsQueryOptions(user.department.id)
        ),
      ])
    },
    component: UpdateUserPage,
    pendingComponent: LayoutPagePending,
  }
)
