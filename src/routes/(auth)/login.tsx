import { createFileRoute } from "@tanstack/react-router"

import { LoginPage } from "@/features/auth/pages/LoginPage"
import { loginSearchSchema } from "@/features/auth/schemas/login.schema"

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
})
