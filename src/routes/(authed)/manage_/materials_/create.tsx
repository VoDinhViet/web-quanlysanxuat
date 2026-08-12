import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { CreateMaterialPage } from "@/features/materials/pages/CreateMaterialPage"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/materials_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "items:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(unitOptionsQueryOptions("MATERIAL")),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: CreateMaterialPage,
  pendingComponent: PageLoading,
})
