import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { UpdateMaterialPage } from "@/features/materials/pages/UpdateMaterialPage"
import { materialQueryOptions } from "@/features/materials/api/options"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute(
  "/(authed)/manage_/materials_/$materialId/update"
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.query({
        ...materialQueryOptions(params.materialId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...unitOptionsQueryOptions("MATERIAL"),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...supplierOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: UpdateMaterialPage,
  pendingComponent: LayoutPagePending,
})
