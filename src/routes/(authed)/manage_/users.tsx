import { createFileRoute } from "@tanstack/react-router"

import { UsersPage } from "@/features/users/pages/users-page"

export const Route = createFileRoute("/(authed)/manage_/users")({
  component: UsersPage,
})
