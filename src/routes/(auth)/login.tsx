import { createFileRoute } from "@tanstack/react-router"

import { redirectIfAuthenticated } from "@/features/auth/api/guard"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { loginSearchSchema } from "@/features/auth/schemas/login.schema"

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) =>
    redirectIfAuthenticated(search.redirectTo, context.queryClient),
  component: LoginPage,
})
