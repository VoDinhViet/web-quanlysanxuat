import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { UpdateMaterialPage } from "@/features/materials/pages/UpdateMaterialPage"
import { materialQueryOptions } from "@/features/materials/api/options"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute(
  "/(authed)/manage_/materials_/$materialId/update"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "items:update"),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        materialQueryOptions(params.materialId)
      ),
      context.queryClient.ensureQueryData(unitOptionsQueryOptions("MATERIAL")),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: UpdateMaterialPage,
  pendingComponent: PageLoading,
})
