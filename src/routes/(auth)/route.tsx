import { createFileRoute } from "@tanstack/react-router"

import { AuthLayout } from "@/features/auth/pages/AuthLayout"

export const Route = createFileRoute("/(auth)")({
  component: AuthLayout,
})
