import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { departmentsQueryOptions } from "@/features/departments/api/options"
import { DepartmentsPage } from "@/features/departments/pages/DepartmentsPage"
import { departmentsSearchSchema } from "@/features/departments/schemas/departments-search.schema"

export const Route = createFileRoute("/(authed)/manage_/departments/")({
  validateSearch: departmentsSearchSchema,
  // No loaderDeps: a search-box navigation must not create a new route match (that would
  // re-trigger this loader and blank the outlet). The list itself is read client-side in
  // DepartmentsPage via useQuery instead — see units' index.tsx, the pattern this mirrors.
  loader: ({ context, location }) => {
    return context.queryClient.query({
      ...departmentsQueryOptions(
        departmentsSearchSchema.parse(location.search)
      ),
      staleTime: "static",
    })
  },
  component: DepartmentsPage,
  // The parent route.tsx already renders the real PageTitleBar and never pends, so this only
  // needs to blank the content area — not LayoutPagePending's full-page header placeholder,
  // which would stack under the real one.
  pendingComponent: PagePending,
})
