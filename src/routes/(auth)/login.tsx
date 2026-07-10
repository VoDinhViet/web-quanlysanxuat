import { createFileRoute } from "@tanstack/react-router"

import { LoginPage } from "@/features/auth/pages/login-page"
import { loginSearchSchema } from "@/features/auth/schemas/login.schema"

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
})
