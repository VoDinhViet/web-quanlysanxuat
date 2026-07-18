import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateUserPage } from "@/features/users/pages/CreateUserPage"
import { getDepartments } from "@/features/users/server-functions/get-departments"
import { getPositions } from "@/features/users/server-functions/get-positions"

export const Route = createFileRoute("/(authed)/manage_/users_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "users:create"),
  loader: async () => {
    const [departments, positions] = await Promise.all([
      getDepartments(),
      getPositions(),
    ])

    return { departments, positions }
  },
  component: CreateUserPage,
})
