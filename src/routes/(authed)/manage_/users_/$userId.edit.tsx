import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { EditUserPage } from "@/features/users/pages/EditUserPage"
import { getDepartments } from "@/features/users/server-functions/get-departments"
import { getPositions } from "@/features/users/server-functions/get-positions"
import { getUser } from "@/features/users/server-functions/get-user"

export const Route = createFileRoute("/(authed)/manage_/users_/$userId/edit")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "users:update"),
  loader: async ({ params }) => {
    const [user, departments, positions] = await Promise.all([
      getUser({ data: { userId: params.userId } }),
      getDepartments(),
      getPositions(),
    ])

    return { user, departments, positions }
  },
  component: EditUserPage,
})
