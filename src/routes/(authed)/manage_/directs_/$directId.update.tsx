import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { UpdateDirectPage } from "@/features/directs/pages/UpdateDirectPage"
import { directQueryOptions } from "@/features/directs/api/options"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute(
  "/(authed)/manage_/directs_/$directId/update"
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.query({
        ...directQueryOptions(params.directId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...unitOptionsQueryOptions(),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...supplierOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: UpdateDirectPage,
  pendingComponent: LayoutPagePending,
})
