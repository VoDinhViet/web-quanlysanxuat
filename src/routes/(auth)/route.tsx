import { createFileRoute } from "@tanstack/react-router"

import { AuthLayout } from "@/features/auth/pages/auth-layout"

export const Route = createFileRoute("/(auth)")({
  component: AuthLayout,
})
