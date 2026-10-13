import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { ncrsQueryOptions } from "@/features/ncrs/api/options"
import { NcrsPage } from "@/features/ncrs/pages/NcrsPage"
import { ncrsSearchSchema } from "@/features/ncrs/schemas/ncrs-search.schema"

export const Route = createFileRoute("/(authed)/manage_/ncrs/")({
  validateSearch: ncrsSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...ncrsQueryOptions(ncrsSearchSchema.parse(location.search)),
      staleTime: "static",
    }),
  component: NcrsPage,
  pendingComponent: PagePending,
})
