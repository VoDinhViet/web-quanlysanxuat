import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { CreateUserPage } from "@/features/users/pages/CreateUserPage"

// `positionsQueryOptions` needs a `departmentId` the form doesn't have yet on mount (CreateUserJobInfoSection
// fetches it itself once a department is picked); `rolesQueryOptions` needs `roles:read`, which this
// route doesn't require (CreateUserCredentialSection fetches it itself via `useQuery`, tolerating 403).
export const Route = createFileRoute("/(authed)/manage_/users_/create/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(departmentOptionsQueryOptions()),
  component: CreateUserPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
