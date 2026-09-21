import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { DepartmentDetailPage } from "@/features/departments/pages/DepartmentDetailPage"
import { departmentDetailQueryOptions } from "@/features/departments/api/options"

export const Route = createFileRoute(
  "/(authed)/manage_/departments_/$departmentId"
)({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...departmentDetailQueryOptions(params.departmentId),
      staleTime: "static",
    }),
  component: DepartmentDetailPage,
  pendingComponent: LayoutPagePending,
})
