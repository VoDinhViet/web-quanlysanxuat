import { createFileRoute } from "@tanstack/react-router"

import { CreateUserPage } from "@/features/users/pages/create-user-page"
import { getDepartments } from "@/features/users/server-functions/get-departments"
import { getPositions } from "@/features/users/server-functions/get-positions"

export const Route = createFileRoute("/(authed)/manage_/users_/add")({
  loader: async () => {
    const [departments, positions] = await Promise.all([
      getDepartments(),
      getPositions(),
    ])

    return { departments, positions }
  },
  component: CreateUserPage,
  // no explicit try/catch here — a thrown server-function error bubbles to the
  // `errorComponent` defined on the (authed) layout route
})
