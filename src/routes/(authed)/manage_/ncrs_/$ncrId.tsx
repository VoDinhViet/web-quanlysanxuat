import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { ncrQueryOptions } from "@/features/ncrs/api/options"
import { NcrDetailPage } from "@/features/ncrs/pages/NcrDetailPage"

export const Route = createFileRoute("/(authed)/manage_/ncrs_/$ncrId")({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...ncrQueryOptions(params.ncrId),
      staleTime: "static",
    }),
  component: NcrDetailPage,
  pendingComponent: LayoutPagePending,
})
