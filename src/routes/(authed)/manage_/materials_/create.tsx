import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { CreateMaterialPage } from "@/features/materials/pages/CreateMaterialPage"
import { materialGroupOptionsQueryOptions } from "@/features/materials/api/options"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/materials_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(unitOptionsQueryOptions("MATERIAL")),
      context.queryClient.ensureQueryData(materialGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: CreateMaterialPage,
  pendingComponent: PageLoading,
})
