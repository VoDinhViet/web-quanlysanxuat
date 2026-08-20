import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { CreateUserPage } from "@/features/users/pages/CreateUserPage"
import { departmentOptionsQueryOptions } from "@/features/departments/api"

// `positionsQueryOptions` needs a `departmentId` the form doesn't have yet on mount (CreateUserJobInfoSection
// fetches it itself once a department is picked); `rolesQueryOptions` needs `roles:read`, which this
// route doesn't require (CreateUserCredentialSection fetches it itself via `useQuery`, tolerating 403).
export const Route = createFileRoute("/(authed)/manage_/users_/create")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(departmentOptionsQueryOptions()),
  component: CreateUserPage,
  pendingComponent: PageLoading,
})
